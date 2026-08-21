import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabase } from "@/db";
import {
  organization,
  productionFeedback,
  productionFeedbackContract,
  project,
  projectIngestToken,
  qaMemoryCandidate,
  qualityContract,
  verificationRun,
} from "@/db/schema";
import {
  parseProductionFeedbackEnvelope,
  productionFeedbackPayloadHash,
} from "@/lib/production-feedback";
import {
  authenticateProjectTokenForFeedback,
  ingestProductionFeedback,
} from "@/lib/production-feedback-store";
import { hashProjectToken } from "@/lib/project-tokens";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required for integration tests.");

const database = createDatabase(databaseUrl);
const suffix = randomUUID();
const organizationId = `integration-${suffix}`;
const rawToken = `maru_${randomUUID().replaceAll("-", "")}${suffix.slice(0, 11)}`;
const commitSha = "8f2c1a7d5e3b";
let projectId = "";
let tokenId = "";
let contractId = "";
let runId = "";

describe("production feedback Neon transaction", () => {
  beforeAll(async () => {
    await database.insert(organization).values({
      id: organizationId,
      name: "Integration workspace",
      slug: `integration-${suffix}`,
    });
    const [createdProject] = await database
      .insert(project)
      .values({
        name: "Integration project",
        organizationId,
        repository: `https://github.com/marucheck/integration-${suffix}`,
        slug: `integration-${suffix}`,
      })
      .returning({ id: project.id });
    if (!createdProject) throw new Error("Integration project setup failed.");
    projectId = createdProject.id;

    const [createdToken] = await database
      .insert(projectIngestToken)
      .values({
        organizationId,
        projectId,
        tokenHash: hashProjectToken(rawToken),
        tokenPrefix: rawToken.slice(0, 12),
      })
      .returning({ id: projectIngestToken.id });
    const [createdContract] = await database
      .insert(qualityContract)
      .values({
        contractKey: "invoice-access",
        organizationId,
        projectId,
        status: "approved",
        title: "Invoice access",
      })
      .returning({ id: qualityContract.id });
    const [createdRun] = await database
      .insert(verificationRun)
      .values({
        branch: "main",
        commitSha,
        completedAt: new Date("2026-08-21T07:55:00.000Z"),
        organizationId,
        projectId,
        risk: 91,
        riskLevel: "critical",
        runKey: `RUN-${suffix}`,
        startedAt: new Date("2026-08-21T07:54:00.000Z"),
        status: "blocked",
        title: "Invoice ownership verification",
      })
      .returning({ id: verificationRun.id });
    if (!createdToken || !createdContract || !createdRun) {
      throw new Error("Integration evidence setup failed.");
    }
    tokenId = createdToken.id;
    contractId = createdContract.id;
    runId = createdRun.id;
  });

  afterAll(async () => {
    await database.delete(organization).where(eq(organization.id, organizationId));
  });

  it("authenticates, links evidence, aggregates occurrences, and rejects altered replay", async () => {
    const now = new Date("2026-08-21T08:00:00.000Z");
    const credential = await authenticateProjectTokenForFeedback(databaseUrl, rawToken, now);
    expect(credential).toEqual({ organizationId, projectId, tokenId });

    const firstEnvelope = eventEnvelope("evt-integration-1");
    const accepted = await ingestProductionFeedback(
      databaseUrl,
      credential!,
      firstEnvelope,
      productionFeedbackPayloadHash(firstEnvelope),
      now,
    );
    expect(accepted).toMatchObject({ occurrenceCount: 1, status: "accepted" });

    const [aggregate] = await database
      .select({
        occurrenceCount: productionFeedback.occurrenceCount,
        verificationRunId: productionFeedback.verificationRunId,
      })
      .from(productionFeedback)
      .where(eq(productionFeedback.id, accepted.feedbackId));
    expect(aggregate).toEqual({ occurrenceCount: 1, verificationRunId: runId });
    await expect(
      database
        .select({ contractId: productionFeedbackContract.contractId })
        .from(productionFeedbackContract)
        .where(
          and(
            eq(productionFeedbackContract.feedbackId, accepted.feedbackId),
            eq(productionFeedbackContract.contractId, contractId),
          ),
        ),
    ).resolves.toHaveLength(1);
    await expect(
      database
        .select({ status: qaMemoryCandidate.status })
        .from(qaMemoryCandidate)
        .where(eq(qaMemoryCandidate.id, accepted.candidateId)),
    ).resolves.toEqual([{ status: "pending" }]);

    const replayed = await ingestProductionFeedback(
      databaseUrl,
      credential!,
      firstEnvelope,
      productionFeedbackPayloadHash(firstEnvelope),
      now,
    );
    expect(replayed).toMatchObject({ occurrenceCount: 1, status: "replayed" });

    const secondEnvelope = eventEnvelope("evt-integration-2");
    const aggregated = await ingestProductionFeedback(
      databaseUrl,
      credential!,
      secondEnvelope,
      productionFeedbackPayloadHash(secondEnvelope),
      now,
    );
    expect(aggregated).toMatchObject({
      feedbackId: accepted.feedbackId,
      occurrenceCount: 2,
      status: "accepted",
    });

    const alteredEnvelope = eventEnvelope("evt-integration-1", "Altered replay title");
    await expect(
      ingestProductionFeedback(
        databaseUrl,
        credential!,
        alteredEnvelope,
        productionFeedbackPayloadHash(alteredEnvelope),
        now,
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

function eventEnvelope(id: string, title = "Cross-tenant invoice read") {
  return parseProductionFeedbackEnvelope(
    {
      event: {
        attributes: { "http.status_code": 500 },
        branch: "main",
        commitSha,
        contractRefs: ["invoice-access"],
        environment: "beta",
        exception: {
          frames: [{ file: "src/invoices/read-invoice.ts", function: "readInvoice", line: 84 }],
          message: "Invoice lookup crossed an organization boundary.",
          type: "AuthorizationBoundaryError",
        },
        fingerprint: "invoice-cross-tenant-read",
        id,
        occurredAt: "2026-08-21T07:58:00.000Z",
        relatedFiles: ["src/invoices/read-invoice.ts"],
        reproduction: {
          observed: "An invoice from another organization was returned.",
          steps: ["Use organization A", "Request an invoice owned by organization B"],
        },
        requirementRefs: ["invoice-access#INV-001"],
        severity: "critical",
        source: "generic",
        tags: ["authorization"],
        title,
        type: "exception",
      },
      schemaVersion: 1,
    },
    { now: new Date("2026-08-21T08:00:00.000Z") },
  );
}
