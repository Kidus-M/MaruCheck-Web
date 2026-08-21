import "server-only";

import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { createDatabase } from "@/db";
import { productionFeedback, project, qaMemoryCandidate, verificationRun } from "@/db/schema";
import type { Severity } from "@/lib/dashboard-types";
import { requireWorkspaceContext } from "@/lib/session";

export interface ProductionFeedbackSummary {
  readonly branch?: string;
  readonly candidate: {
    readonly id: string;
    readonly regressionProposal: {
      readonly objective: string;
      readonly requirementRefs: readonly string[];
      readonly status: "proposed";
      readonly suggestedAdapter?: "playwright" | "vitest";
      readonly suggestedPath?: string;
    };
    readonly reproductionProposal: {
      readonly observed: string;
      readonly steps: readonly string[];
    };
    readonly reviewedAt?: string;
    readonly reviewedBy?: string;
    readonly rootCause?: string;
    readonly status: "approved" | "pending" | "rejected";
  };
  readonly commit?: string;
  readonly environment: string;
  readonly exceptionType: string;
  readonly firstSeen: string;
  readonly frames: readonly {
    readonly column?: number;
    readonly file: string;
    readonly function?: string;
    readonly line?: number;
  }[];
  readonly id: string;
  readonly lastSeen: string;
  readonly message: string;
  readonly occurrences: number;
  readonly project: string;
  readonly regressionRun?: string;
  readonly relatedContracts: readonly string[];
  readonly relatedFiles: readonly string[];
  readonly requirementRefs: readonly string[];
  readonly severity: Severity;
  readonly source: "generic";
  readonly status: "open" | "resolved";
  readonly tags: readonly string[];
  readonly title: string;
  readonly type: string;
}

export const getProductionFeedback = cache(
  async (): Promise<readonly ProductionFeedbackSummary[]> => {
    const context = await requireWorkspaceContext();
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is required to read production feedback.");
    const database = createDatabase(databaseUrl);
    const rows = await database
      .select({
        branch: productionFeedback.branch,
        candidateId: qaMemoryCandidate.id,
        candidateStatus: qaMemoryCandidate.status,
        commitSha: productionFeedback.commitSha,
        environment: productionFeedback.environment,
        exceptionType: productionFeedback.exceptionType,
        firstReceivedAt: productionFeedback.firstReceivedAt,
        frames: productionFeedback.frames,
        id: productionFeedback.id,
        lastReceivedAt: productionFeedback.lastReceivedAt,
        message: productionFeedback.message,
        occurrenceCount: productionFeedback.occurrenceCount,
        projectName: project.name,
        regressionProposal: qaMemoryCandidate.regressionProposal,
        relatedContracts: qaMemoryCandidate.relatedContracts,
        relatedFiles: productionFeedback.relatedFiles,
        reproductionProposal: qaMemoryCandidate.reproductionProposal,
        requirementRefs: productionFeedback.requirementRefs,
        reviewedAt: qaMemoryCandidate.reviewedAt,
        reviewedBy: qaMemoryCandidate.reviewedBy,
        rootCause: qaMemoryCandidate.rootCause,
        runKey: verificationRun.runKey,
        severity: productionFeedback.severity,
        source: productionFeedback.source,
        status: productionFeedback.status,
        tags: productionFeedback.tags,
        title: productionFeedback.title,
        type: productionFeedback.eventType,
      })
      .from(productionFeedback)
      .innerJoin(project, eq(project.id, productionFeedback.projectId))
      .innerJoin(qaMemoryCandidate, eq(qaMemoryCandidate.feedbackId, productionFeedback.id))
      .leftJoin(verificationRun, eq(verificationRun.id, productionFeedback.verificationRunId))
      .where(eq(productionFeedback.organizationId, context.organization.id))
      .orderBy(desc(productionFeedback.lastReceivedAt))
      .limit(200);

    return rows.map((row) => ({
      ...(row.branch === null ? {} : { branch: row.branch }),
      candidate: {
        id: row.candidateId,
        regressionProposal: row.regressionProposal,
        reproductionProposal: row.reproductionProposal,
        ...(row.reviewedAt === null ? {} : { reviewedAt: absoluteDate(row.reviewedAt) }),
        ...(row.reviewedBy === null ? {} : { reviewedBy: row.reviewedBy }),
        ...(row.rootCause === null ? {} : { rootCause: row.rootCause }),
        status: row.candidateStatus,
      },
      ...(row.commitSha === null ? {} : { commit: row.commitSha }),
      environment: row.environment,
      exceptionType: row.exceptionType,
      firstSeen: relativeTime(row.firstReceivedAt),
      frames: row.frames,
      id: row.id,
      lastSeen: relativeTime(row.lastReceivedAt),
      message: row.message,
      occurrences: row.occurrenceCount,
      project: row.projectName,
      ...(row.runKey === null ? {} : { regressionRun: row.runKey }),
      relatedContracts: row.relatedContracts,
      relatedFiles: row.relatedFiles,
      requirementRefs: row.requirementRefs,
      severity: row.severity === "info" ? "low" : row.severity,
      source: row.source,
      status: row.status,
      tags: row.tags,
      title: row.title,
      type: row.type,
    }));
  },
);

function absoluteDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function relativeTime(date: Date): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1_000));
  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} day${days === 1 ? "" : "s"} ago` : absoluteDate(date);
}
