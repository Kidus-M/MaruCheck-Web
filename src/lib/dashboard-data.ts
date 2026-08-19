import "server-only";
import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { createDatabase } from "@/db";
import {
  finding,
  project,
  qaMemory,
  qualityContract,
  requirementCoverage,
  verificationRun,
} from "@/db/schema";
import type {
  ActivityItem,
  DashboardSnapshot,
  FindingSummary,
  Severity,
} from "@/lib/dashboard-types";
import { requireWorkspaceContext } from "@/lib/session";

export type * from "@/lib/dashboard-types";

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required to read hosted product data.");
  return createDatabase(databaseUrl);
}

/** Read the authorized workspace's hosted metadata; every query is organization-scoped here. */
export const getDashboardSnapshot = cache(async (): Promise<DashboardSnapshot> => {
  const context = await requireWorkspaceContext();
  const organizationId = context.organization.id;
  const database = getDatabase();
  const [projectRows, contractRows, runRows, findingRows, coverageRows, memoryRows] =
    await Promise.all([
      database
        .select({
          activeContracts: project.activeContracts,
          branch: project.branch,
          coverage: project.coverage,
          findingCount: project.findingCount,
          id: project.id,
          lastVerifiedAt: project.lastVerifiedAt,
          name: project.name,
          repository: project.repository,
          risk: project.risk,
          slug: project.slug,
          status: project.status,
        })
        .from(project)
        .where(eq(project.organizationId, organizationId))
        .orderBy(desc(project.updatedAt))
        .limit(100),
      database
        .select({
          contractKey: qualityContract.contractKey,
          coverage: qualityContract.coverage,
          intent: qualityContract.intent,
          owner: qualityContract.owner,
          projectId: qualityContract.projectId,
          requirements: qualityContract.requirements,
          status: qualityContract.status,
          title: qualityContract.title,
          updatedAt: qualityContract.updatedAt,
          version: qualityContract.currentVersion,
        })
        .from(qualityContract)
        .where(eq(qualityContract.organizationId, organizationId))
        .orderBy(desc(qualityContract.updatedAt))
        .limit(200),
      database
        .select({
          commitSha: verificationRun.commitSha,
          completedAt: verificationRun.completedAt,
          createdAt: verificationRun.createdAt,
          durationMs: verificationRun.durationMs,
          evidenceCount: verificationRun.evidenceCount,
          id: verificationRun.id,
          projectId: verificationRun.projectId,
          risk: verificationRun.risk,
          runKey: verificationRun.runKey,
          status: verificationRun.status,
          title: verificationRun.title,
        })
        .from(verificationRun)
        .where(eq(verificationRun.organizationId, organizationId))
        .orderBy(desc(verificationRun.createdAt))
        .limit(100),
      database
        .select({
          actual: finding.actual,
          artifactRefs: finding.artifactRefs,
          evidenceIds: finding.evidenceIds,
          expected: finding.expected,
          findingKey: finding.findingKey,
          firstSeenAt: finding.firstSeenAt,
          occurrenceCount: finding.occurrenceCount,
          owner: finding.owner,
          projectId: finding.projectId,
          reproduction: finding.reproduction,
          requirementRef: finding.requirementRef,
          runId: finding.runId,
          severity: finding.severity,
          status: finding.status,
          title: finding.title,
        })
        .from(finding)
        .where(eq(finding.organizationId, organizationId))
        .orderBy(desc(finding.firstSeenAt))
        .limit(200),
      database
        .select({
          color: requirementCoverage.color,
          covered: requirementCoverage.covered,
          evidenceCount: requirementCoverage.evidenceCount,
          label: requirementCoverage.label,
          total: requirementCoverage.total,
        })
        .from(requirementCoverage)
        .where(eq(requirementCoverage.organizationId, organizationId))
        .orderBy(desc(requirementCoverage.updatedAt))
        .limit(200),
      database
        .select({
          id: qaMemory.memoryKey,
          lastMatchedAt: qaMemory.lastMatchedAt,
          regressionCount: qaMemory.regressionCount,
          severity: qaMemory.severity,
          summary: qaMemory.summary,
          tags: qaMemory.tags,
          title: qaMemory.title,
        })
        .from(qaMemory)
        .where(eq(qaMemory.organizationId, organizationId))
        .orderBy(desc(qaMemory.lastMatchedAt), desc(qaMemory.createdAt))
        .limit(200),
    ]);

  const projectNames = new Map(projectRows.map((row) => [row.id, row.name]));
  const runByDatabaseId = new Map(runRows.map((row) => [row.id, row.runKey]));
  const findings: FindingSummary[] = findingRows
    .filter((row) => row.status !== "fixed" && row.status !== "false-positive")
    .map((row) => {
      const runKey = runByDatabaseId.get(row.runId) ?? "run";
      return {
        actual: row.actual,
        age: relativeTime(row.firstSeenAt).replace(/ ago$/, ""),
        contract: row.requirementRef ?? "Unlinked evidence",
        evidence: [...row.evidenceIds, ...row.artifactRefs],
        expected: row.expected || "No approved expectation was linked.",
        id: `${runKey}--${row.findingKey}`,
        occurrences: row.occurrenceCount,
        owner: row.owner,
        project: projectNames.get(row.projectId) ?? "Unknown project",
        reproduction: row.reproduction.command,
        severity: normalizeSeverity(row.severity),
        status: row.status,
        title: row.title,
      };
    });

  const activity: ActivityItem[] = [
    ...findingRows.slice(0, 8).map((row) => ({
      detail: `${row.requirementRef ?? row.findingKey} · ${projectNames.get(row.projectId) ?? "Project"}`,
      id: `finding-${row.runId}-${row.findingKey}`,
      occurredAt: row.firstSeenAt,
      status: "attention" as const,
      title: row.title,
    })),
    ...runRows.slice(0, 8).map((row) => ({
      detail: `${projectNames.get(row.projectId) ?? "Project"} · ${row.commitSha.slice(0, 12)}`,
      id: `run-${row.runKey}`,
      occurredAt: row.completedAt ?? row.createdAt,
      status:
        row.status === "blocked"
          ? ("attention" as const)
          : row.status === "passed"
            ? ("complete" as const)
            : ("neutral" as const),
      title: `${row.runKey} ${row.status === "running" ? "is running" : row.status}`,
    })),
  ]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 8)
    .map(({ occurredAt, ...item }) => ({ ...item, time: relativeTime(occurredAt) }));

  return {
    activity,
    contracts: contractRows.map((row) => ({
      coverage: row.coverage,
      id: row.contractKey,
      intent: row.intent,
      owner: row.owner,
      projectId: row.projectId,
      requirements: row.requirements,
      status: row.status,
      title: row.title,
      updated: absoluteDate(row.updatedAt),
      version: row.version,
    })),
    coverage: coverageRows.map((row) => ({
      color: row.color,
      covered: row.covered,
      evidence: row.evidenceCount,
      label: row.label,
      total: row.total,
    })),
    findings,
    memory: memoryRows.map((row) => ({
      id: row.id,
      lastMatched: row.lastMatchedAt ? relativeTime(row.lastMatchedAt) : "Never",
      regressions: row.regressionCount,
      severity: normalizeSeverity(row.severity),
      summary: row.summary,
      tags: row.tags,
      title: row.title,
    })),
    organization: context.organization,
    projects: projectRows.map((row) => ({
      activeContracts: row.activeContracts,
      branch: row.branch,
      coverage: row.coverage,
      findingCount: row.findingCount,
      id: row.id,
      lastVerified: row.lastVerifiedAt ? relativeTime(row.lastVerifiedAt) : "Never",
      name: row.name,
      repository: row.repository,
      risk: row.risk,
      slug: row.slug,
      status: row.status,
    })),
    runs: runRows.map((row) => ({
      commit: row.commitSha.slice(0, 12),
      completedAt: relativeTime(row.completedAt ?? row.createdAt),
      duration: durationLabel(row.durationMs, row.status),
      evidence: row.evidenceCount,
      id: row.runKey,
      project: projectNames.get(row.projectId) ?? "Unknown project",
      risk: row.risk,
      status: row.status,
      title: row.title,
    })),
    viewer: context.viewer,
  };
});

function normalizeSeverity(severity: string): Severity {
  return severity === "info" ? "low" : (severity as Severity);
}

function durationLabel(durationMs: number | null, status: string): string {
  if (durationMs === null) return status === "running" ? "Running" : "Unavailable";
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function absoluteDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function relativeTime(date: Date): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return absoluteDate(date);
}
