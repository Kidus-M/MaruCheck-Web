import "server-only";

import { and, desc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { createDatabase, createTransactionalDatabase } from "@/db";
import {
  feedbackIngestionRateWindow,
  productionFeedback,
  productionFeedbackAudit,
  productionFeedbackContract,
  productionFeedbackDelivery,
  project,
  projectIngestToken,
  qaMemoryCandidate,
  qualityContract,
  verificationRun,
} from "@/db/schema";
import {
  PRODUCTION_FEEDBACK_RATE_LIMIT,
  PRODUCTION_FEEDBACK_RETENTION_DAYS,
  decideFeedbackDelivery,
  deriveFeedbackCandidate,
  type ProductionFeedbackEnvelope,
} from "@/lib/production-feedback";
import {
  FeedbackServiceError,
  type FeedbackCredential,
  type FeedbackIngestionResult,
} from "@/lib/production-feedback-handler";
import { hashProjectToken } from "@/lib/project-tokens";

export async function authenticateProjectTokenForFeedback(
  databaseUrl: string,
  rawToken: string,
  now: Date,
): Promise<FeedbackCredential | undefined> {
  const database = createDatabase(databaseUrl);
  const [credential] = await database
    .select({
      organizationId: projectIngestToken.organizationId,
      projectId: project.id,
      tokenId: projectIngestToken.id,
    })
    .from(projectIngestToken)
    .innerJoin(project, eq(project.id, projectIngestToken.projectId))
    .where(
      and(
        eq(projectIngestToken.tokenHash, hashProjectToken(rawToken)),
        eq(project.organizationId, projectIngestToken.organizationId),
        isNull(projectIngestToken.revokedAt),
        or(isNull(projectIngestToken.expiresAt), gt(projectIngestToken.expiresAt, now)),
      ),
    )
    .limit(1);
  return credential;
}

/** Persist one authenticated delivery with durable rate, replay, aggregation, and audit policy. */
export async function ingestProductionFeedback(
  databaseUrl: string,
  credential: FeedbackCredential,
  envelope: ProductionFeedbackEnvelope,
  payloadHash: string,
  now: Date,
): Promise<FeedbackIngestionResult> {
  const connection = createTransactionalDatabase(databaseUrl);
  try {
    const result = await connection.database.transaction(async (transaction) => {
      const windowStartedAt = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
      const [rate] = await transaction
        .insert(feedbackIngestionRateWindow)
        .values({
          organizationId: credential.organizationId,
          requestCount: 1,
          tokenId: credential.tokenId,
          windowStartedAt,
        })
        .onConflictDoUpdate({
          target: [
            feedbackIngestionRateWindow.tokenId,
            feedbackIngestionRateWindow.windowStartedAt,
          ],
          set: {
            requestCount: sql`${feedbackIngestionRateWindow.requestCount} + 1`,
          },
        })
        .returning({ requestCount: feedbackIngestionRateWindow.requestCount });
      if (!rate || rate.requestCount > PRODUCTION_FEEDBACK_RATE_LIMIT) {
        throw new FeedbackServiceError(
          "RATE_LIMITED",
          `Project token exceeded ${PRODUCTION_FEEDBACK_RATE_LIMIT} production events per minute.`,
          { retryAfterSeconds: 60 },
        );
      }

      const event = envelope.event;
      // Serialize deliveries for one external event key so concurrent retries cannot increment
      // the aggregate before the unique delivery record becomes visible.
      await transaction.execute(
        sql`select pg_advisory_xact_lock(hashtext(${credential.projectId}), hashtext(${`${event.source}:${event.id}`}))`,
      );
      const [delivery] = await transaction
        .select({
          candidateId: qaMemoryCandidate.id,
          feedbackId: productionFeedbackDelivery.feedbackId,
          occurrenceCount: productionFeedback.occurrenceCount,
          payloadHash: productionFeedbackDelivery.payloadHash,
        })
        .from(productionFeedbackDelivery)
        .innerJoin(
          productionFeedback,
          eq(productionFeedback.id, productionFeedbackDelivery.feedbackId),
        )
        .leftJoin(
          qaMemoryCandidate,
          eq(qaMemoryCandidate.feedbackId, productionFeedbackDelivery.feedbackId),
        )
        .where(
          and(
            eq(productionFeedbackDelivery.projectId, credential.projectId),
            eq(productionFeedbackDelivery.source, event.source),
            eq(productionFeedbackDelivery.eventKey, event.id),
          ),
        )
        .limit(1);

      const deliveryDecision = decideFeedbackDelivery(delivery?.payloadHash, payloadHash);
      if (delivery !== undefined) {
        await transaction.insert(productionFeedbackAudit).values({
          action: deliveryDecision === "replay" ? "replayed" : "conflict",
          eventKey: event.id,
          feedbackId: delivery.feedbackId,
          organizationId: credential.organizationId,
          payloadHash,
          projectId: credential.projectId,
          tokenId: credential.tokenId,
        });
        await transaction
          .update(projectIngestToken)
          .set({ lastUsedAt: now })
          .where(eq(projectIngestToken.id, credential.tokenId));
        return {
          candidateId: delivery.candidateId,
          feedbackId: delivery.feedbackId,
          occurrenceCount: delivery.occurrenceCount,
          status: deliveryDecision,
        } as const;
      }

      const linkedRun =
        event.commitSha === undefined
          ? undefined
          : (
              await transaction
                .select({ id: verificationRun.id })
                .from(verificationRun)
                .where(
                  and(
                    eq(verificationRun.organizationId, credential.organizationId),
                    eq(verificationRun.projectId, credential.projectId),
                    eq(verificationRun.commitSha, event.commitSha),
                  ),
                )
                .orderBy(desc(verificationRun.completedAt), desc(verificationRun.createdAt))
                .limit(1)
            )[0];

      const contracts =
        event.contractRefs.length === 0
          ? []
          : await transaction
              .select({ contractId: qualityContract.id, contractKey: qualityContract.contractKey })
              .from(qualityContract)
              .where(
                and(
                  eq(qualityContract.organizationId, credential.organizationId),
                  inArray(qualityContract.contractKey, event.contractRefs),
                  or(
                    eq(qualityContract.projectId, credential.projectId),
                    isNull(qualityContract.projectId),
                  ),
                ),
              );

      const candidate = deriveFeedbackCandidate(event);
      const retentionUntil = new Date(
        now.getTime() + PRODUCTION_FEEDBACK_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
      );
      const [feedback] = await transaction
        .insert(productionFeedback)
        .values({
          attributes: event.attributes,
          branch: event.branch,
          commitSha: event.commitSha,
          environment: event.environment,
          eventType: event.type,
          exceptionType: event.exception.type,
          fingerprint: event.fingerprint,
          frames: event.exception.frames,
          lastReceivedAt: now,
          message: event.exception.message,
          occurredAt: event.occurredAt,
          organizationId: credential.organizationId,
          projectId: credential.projectId,
          regressionProposal: candidate.regressionProposal,
          relatedFiles: event.relatedFiles,
          release: event.release,
          reproductionProposal: event.reproduction,
          requirementRefs: event.requirementRefs,
          retentionUntil,
          severity: event.severity,
          source: event.source,
          tags: event.tags,
          title: event.title,
          tokenId: credential.tokenId,
          verificationRunId: linkedRun?.id,
        })
        .onConflictDoUpdate({
          target: [
            productionFeedback.projectId,
            productionFeedback.source,
            productionFeedback.fingerprint,
          ],
          set: {
            attributes: event.attributes,
            branch: event.branch ?? null,
            commitSha: event.commitSha ?? null,
            environment: event.environment,
            eventType: event.type,
            exceptionType: event.exception.type,
            frames: event.exception.frames,
            lastReceivedAt: now,
            message: event.exception.message,
            occurrenceCount: sql`${productionFeedback.occurrenceCount} + 1`,
            occurredAt: event.occurredAt,
            regressionProposal: candidate.regressionProposal,
            relatedFiles: event.relatedFiles,
            release: event.release ?? null,
            reproductionProposal: event.reproduction,
            requirementRefs: event.requirementRefs,
            retentionUntil,
            severity: event.severity,
            tags: event.tags,
            title: event.title,
            tokenId: credential.tokenId,
            verificationRunId: linkedRun?.id ?? null,
          },
        })
        .returning({
          id: productionFeedback.id,
          occurrenceCount: productionFeedback.occurrenceCount,
        });
      if (!feedback) throw new Error("Production feedback upsert returned no record.");

      await transaction.insert(productionFeedbackDelivery).values({
        eventKey: event.id,
        feedbackId: feedback.id,
        organizationId: credential.organizationId,
        payloadHash,
        projectId: credential.projectId,
        receivedAt: now,
        source: event.source,
        tokenId: credential.tokenId,
      });
      if (contracts.length > 0) {
        await transaction
          .insert(productionFeedbackContract)
          .values(
            contracts.map((contract) => ({
              contractId: contract.contractId,
              feedbackId: feedback.id,
              organizationId: credential.organizationId,
              projectId: credential.projectId,
            })),
          )
          .onConflictDoNothing();
      }
      const [createdCandidate] = await transaction
        .insert(qaMemoryCandidate)
        .values({
          feedbackId: feedback.id,
          organizationId: credential.organizationId,
          projectId: credential.projectId,
          regressionProposal: candidate.regressionProposal,
          relatedContracts: contracts.map((contract) => contract.contractKey),
          relatedFiles: event.relatedFiles,
          reproductionProposal: candidate.reproductionProposal,
          severity: event.severity,
          summary: candidate.summary,
          title: candidate.title,
        })
        .onConflictDoNothing({ target: qaMemoryCandidate.feedbackId })
        .returning({ id: qaMemoryCandidate.id });
      const candidateId =
        createdCandidate?.id ??
        (
          await transaction
            .select({ id: qaMemoryCandidate.id })
            .from(qaMemoryCandidate)
            .where(eq(qaMemoryCandidate.feedbackId, feedback.id))
            .limit(1)
        )[0]?.id;
      if (!candidateId) throw new Error("QA memory candidate could not be resolved.");

      await transaction.insert(productionFeedbackAudit).values({
        action: "accepted",
        eventKey: event.id,
        feedbackId: feedback.id,
        organizationId: credential.organizationId,
        payloadHash,
        projectId: credential.projectId,
        tokenId: credential.tokenId,
      });
      await transaction
        .update(projectIngestToken)
        .set({ lastUsedAt: now })
        .where(eq(projectIngestToken.id, credential.tokenId));
      return {
        candidateId,
        feedbackId: feedback.id,
        occurrenceCount: feedback.occurrenceCount,
        status: "accept",
      } as const;
    });

    if (result.status === "conflict") {
      throw new FeedbackServiceError(
        "CONFLICT",
        "This event ID was already used with different content.",
      );
    }
    if (!result.candidateId) {
      throw new Error("The production feedback candidate is unavailable.");
    }
    return {
      candidateId: result.candidateId,
      feedbackId: result.feedbackId,
      occurrenceCount: result.occurrenceCount,
      status: result.status === "replay" ? "replayed" : "accepted",
    };
  } catch (error) {
    if (error instanceof FeedbackServiceError) throw error;
    throw new FeedbackServiceError(
      "UNAVAILABLE",
      "Production feedback persistence is temporarily unavailable.",
      { cause: error },
    );
  } finally {
    await connection.close();
  }
}
