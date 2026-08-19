import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createDatabase } from "@/db";
import {
  evidence,
  finding,
  project,
  projectIngestToken,
  qualityContract,
  requirementCoverage,
  verificationRun,
} from "@/db/schema";
import { IngestionError, parseIngestEnvelope } from "@/lib/ingestion";
import { hashProjectToken } from "@/lib/project-tokens";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 2_000_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return problem(413, "Request body exceeds 2 MB.");

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer "))
    return problem(401, "A project bearer token is required.");
  const rawToken = authorization.slice("Bearer ".length).trim();
  if (!rawToken.startsWith("maru_") || rawToken.length > 128)
    return problem(401, "Project token is invalid.");

  let input: ReturnType<typeof parseIngestEnvelope>;
  try {
    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) return problem(413, "Request body exceeds 2 MB.");
    input = parseIngestEnvelope(JSON.parse(body));
  } catch (error) {
    return problem(
      400,
      error instanceof IngestionError || error instanceof SyntaxError
        ? error.message
        : "The verification report could not be parsed.",
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return problem(503, "Hosted persistence is not configured.");
  const database = createDatabase(databaseUrl);
  const now = new Date();
  const [credential] = await database
    .select({
      id: projectIngestToken.id,
      organizationId: projectIngestToken.organizationId,
      projectId: project.id,
      projectName: project.name,
    })
    .from(projectIngestToken)
    .innerJoin(project, eq(project.id, projectIngestToken.projectId))
    .where(
      and(
        eq(projectIngestToken.tokenHash, hashProjectToken(rawToken)),
        isNull(projectIngestToken.revokedAt),
        or(isNull(projectIngestToken.expiresAt), gt(projectIngestToken.expiresAt, now)),
      ),
    )
    .limit(1);

  if (!credential) return problem(401, "Project token is invalid, expired, or revoked.");
  if (credential.projectName !== input.report.projectName) {
    return problem(409, "The report project does not match the token's connected project.");
  }

  try {
    const result = await database.transaction(async (transaction) => {
      const [run] = await transaction
        .insert(verificationRun)
        .values({
          branch: input.branch,
          commitSha: input.commitSha,
          completedAt: input.completedAt,
          durationMs: Math.max(0, input.completedAt.getTime() - input.startedAt.getTime()),
          evidenceCount: input.report.evidence.length,
          gateReasons: input.report.gate.reasons,
          organizationId: credential.organizationId,
          projectId: credential.projectId,
          risk: input.report.risk.score,
          riskLevel: input.report.risk.level,
          runKey: input.report.runId,
          startedAt: input.startedAt,
          status: input.report.gate.status,
          title: input.title,
        })
        .onConflictDoUpdate({
          target: [verificationRun.projectId, verificationRun.runKey],
          set: {
            branch: input.branch,
            commitSha: input.commitSha,
            completedAt: input.completedAt,
            durationMs: Math.max(0, input.completedAt.getTime() - input.startedAt.getTime()),
            evidenceCount: input.report.evidence.length,
            gateReasons: input.report.gate.reasons,
            risk: input.report.risk.score,
            riskLevel: input.report.risk.level,
            status: input.report.gate.status,
            title: input.title,
          },
        })
        .returning({ id: verificationRun.id, runKey: verificationRun.runKey });
      if (!run) throw new Error("Run upsert did not return a record.");

      const contractGroups = new Map<
        string,
        { evidenceIds: Set<string>; passed: number; title: string; total: number }
      >();
      for (const requirement of input.report.requirementEvidence) {
        const group = contractGroups.get(requirement.contractId) ?? {
          evidenceIds: new Set<string>(),
          passed: 0,
          title: requirement.contractTitle,
          total: 0,
        };
        group.total += 1;
        if (requirement.status === "passed") group.passed += 1;
        requirement.evidenceIds.forEach((id) => group.evidenceIds.add(id));
        contractGroups.set(requirement.contractId, group);
      }

      const contractIds = new Map<string, string>();
      let colorIndex = 0;
      const colors = ["indigo", "mint", "ochre", "coral"] as const;
      for (const [contractKey, group] of contractGroups) {
        const coverage = group.total === 0 ? 0 : Math.round((group.passed / group.total) * 100);
        const [contract] = await transaction
          .insert(qualityContract)
          .values({
            contractKey,
            coverage,
            organizationId: credential.organizationId,
            projectId: credential.projectId,
            requirements: group.total,
            title: group.title,
          })
          .onConflictDoUpdate({
            target: [qualityContract.organizationId, qualityContract.contractKey],
            set: {
              coverage,
              projectId: credential.projectId,
              requirements: group.total,
              title: group.title,
              updatedAt: now,
            },
          })
          .returning({ id: qualityContract.id });
        if (!contract) throw new Error("Contract upsert did not return a record.");
        contractIds.set(contractKey, contract.id);

        await transaction
          .insert(requirementCoverage)
          .values({
            areaKey: `${credential.projectId}:${contractKey}`,
            color: colors[colorIndex % colors.length] ?? "indigo",
            contractId: contract.id,
            covered: group.passed,
            evidenceCount: group.evidenceIds.size,
            label: group.title,
            organizationId: credential.organizationId,
            projectId: credential.projectId,
            total: group.total,
          })
          .onConflictDoUpdate({
            target: [requirementCoverage.organizationId, requirementCoverage.areaKey],
            set: {
              contractId: contract.id,
              covered: group.passed,
              evidenceCount: group.evidenceIds.size,
              label: group.title,
              total: group.total,
              updatedAt: now,
            },
          });
        colorIndex += 1;
      }

      for (const item of input.report.evidence) {
        await transaction
          .insert(evidence)
          .values({
            adapter: item.adapter,
            artifactRefs: item.artifactRefs,
            createdAt: item.createdAt,
            diagnostic: item.diagnostic,
            durationMs: item.durationMs,
            evidenceKey: item.id,
            organizationId: credential.organizationId,
            projectId: credential.projectId,
            requirementRefs: item.requirementRefs,
            runId: run.id,
            status: item.status,
            tool: item.tool,
            type: item.type,
          })
          .onConflictDoUpdate({
            target: [evidence.runId, evidence.evidenceKey],
            set: {
              artifactRefs: item.artifactRefs,
              diagnostic: item.diagnostic,
              durationMs: item.durationMs,
              requirementRefs: item.requirementRefs,
              status: item.status,
            },
          });
      }

      for (const item of input.report.findings) {
        await transaction
          .insert(finding)
          .values({
            actual: item.actual,
            artifactRefs: item.artifactRefs,
            blocking: item.blocking,
            contractId: item.contractId ? contractIds.get(item.contractId) : undefined,
            evidenceIds: item.evidenceIds,
            expected: item.expected ?? "",
            explanation: item.explanation,
            findingKey: item.id,
            kind: item.kind,
            organizationId: credential.organizationId,
            projectId: credential.projectId,
            reproduction: item.reproduction,
            requirementRef: item.requirementRef,
            runId: run.id,
            severity: item.severity,
            status: item.status,
            title: item.title,
          })
          .onConflictDoUpdate({
            target: [finding.runId, finding.findingKey],
            set: {
              actual: item.actual,
              artifactRefs: item.artifactRefs,
              blocking: item.blocking,
              evidenceIds: item.evidenceIds,
              expected: item.expected ?? "",
              explanation: item.explanation,
              occurrenceCount: sql`${finding.occurrenceCount} + 1`,
              reproduction: item.reproduction,
              severity: item.severity,
              status: item.status,
              title: item.title,
              updatedAt: now,
            },
          });
      }

      const requirements = input.report.requirementEvidence.length;
      const passed = input.report.requirementEvidence.filter(
        (item) => item.status === "passed",
      ).length;
      const coverage = requirements === 0 ? 0 : Math.round((passed / requirements) * 100);
      await transaction
        .update(project)
        .set({
          activeContracts: contractGroups.size,
          branch: input.branch,
          coverage,
          findingCount: input.report.findings.length,
          lastVerifiedAt: input.completedAt,
          risk: input.report.risk.score,
          status: input.report.gate.status,
          updatedAt: now,
        })
        .where(
          and(
            eq(project.id, credential.projectId),
            eq(project.organizationId, credential.organizationId),
          ),
        );
      await transaction
        .update(projectIngestToken)
        .set({ lastUsedAt: now })
        .where(
          and(
            eq(projectIngestToken.id, credential.id),
            eq(projectIngestToken.organizationId, credential.organizationId),
          ),
        );
      return run;
    });

    return NextResponse.json(
      { accepted: true, projectId: credential.projectId, runId: result.runKey, schemaVersion: 1 },
      { status: 202 },
    );
  } catch (error) {
    console.error("Verification report ingestion failed", error);
    return problem(500, "The verification report could not be persisted.");
  }
}

function problem(status: number, detail: string) {
  return NextResponse.json(
    {
      detail,
      status,
      title: status === 401 ? "Unauthorized" : "Ingestion failed",
      type: "about:blank",
    },
    { status },
  );
}
