import { sql } from "drizzle-orm";
import {
  check,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

export type GateStatus = "blocked" | "passed" | "running";
export type FindingSeverity = "critical" | "high" | "info" | "low" | "medium";
export type EvidenceStatus = "failed" | "inconclusive" | "passed";

export const project = pgTable(
  "project",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    repository: text("repository").notNull(),
    branch: text("branch").default("main").notNull(),
    status: text("status").$type<GateStatus>().default("running").notNull(),
    risk: integer("risk").default(0).notNull(),
    coverage: integer("coverage").default(0).notNull(),
    findingCount: integer("finding_count").default(0).notNull(),
    activeContracts: integer("active_contracts").default(0).notNull(),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("project_organization_slug_unique").on(table.organizationId, table.slug),
    uniqueIndex("project_organization_repository_unique").on(
      table.organizationId,
      table.repository,
    ),
    index("project_organization_updated_idx").on(table.organizationId, table.updatedAt),
    check("project_risk_range", sql`${table.risk} between 0 and 100`),
    check("project_coverage_range", sql`${table.coverage} between 0 and 100`),
  ],
);

export const projectIngestToken = pgTable(
  "project_ingest_token",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").default("CI").notNull(),
    tokenPrefix: text("token_prefix").notNull(),
    tokenHash: text("token_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("project_ingest_token_hash_unique").on(table.tokenHash),
    index("project_ingest_token_project_idx").on(table.projectId),
    index("project_ingest_token_organization_idx").on(table.organizationId),
  ],
);

export const qualityContract = pgTable(
  "quality_contract",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
    contractKey: text("contract_key").notNull(),
    title: text("title").notNull(),
    intent: text("intent").default("").notNull(),
    owner: text("owner").default("Unassigned").notNull(),
    criticality: text("criticality").default("high").notNull(),
    status: text("status").$type<"approved" | "draft">().default("draft").notNull(),
    currentVersion: text("current_version").default("draft").notNull(),
    requirements: integer("requirements").default(0).notNull(),
    coverage: integer("coverage").default(0).notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("quality_contract_organization_key_unique").on(
      table.organizationId,
      table.contractKey,
    ),
    index("quality_contract_project_idx").on(table.projectId),
    index("quality_contract_organization_updated_idx").on(table.organizationId, table.updatedAt),
    check("quality_contract_coverage_range", sql`${table.coverage} between 0 and 100`),
  ],
);

export const contractVersion = pgTable(
  "contract_version",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => qualityContract.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    contentHash: text("content_hash").notNull(),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    approval: jsonb("approval").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("contract_version_contract_version_unique").on(table.contractId, table.version),
    uniqueIndex("contract_version_contract_hash_unique").on(table.contractId, table.contentHash),
    index("contract_version_organization_idx").on(table.organizationId),
  ],
);

export const verificationRun = pgTable(
  "verification_run",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    runKey: text("run_key").notNull(),
    title: text("title").notNull(),
    commitSha: text("commit_sha").notNull(),
    branch: text("branch").notNull(),
    status: text("status").$type<GateStatus>().notNull(),
    risk: integer("risk").notNull(),
    riskLevel: text("risk_level").notNull(),
    evidenceCount: integer("evidence_count").default(0).notNull(),
    durationMs: integer("duration_ms"),
    gateReasons: jsonb("gate_reasons").$type<readonly string[]>().default([]).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("verification_run_project_key_unique").on(table.projectId, table.runKey),
    index("verification_run_organization_completed_idx").on(
      table.organizationId,
      table.completedAt,
    ),
    index("verification_run_project_completed_idx").on(table.projectId, table.completedAt),
    check("verification_run_risk_range", sql`${table.risk} between 0 and 100`),
  ],
);

export const evidence = pgTable(
  "evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    runId: uuid("run_id")
      .notNull()
      .references(() => verificationRun.id, { onDelete: "cascade" }),
    evidenceKey: text("evidence_key").notNull(),
    type: text("type").notNull(),
    status: text("status").$type<EvidenceStatus>().notNull(),
    adapter: text("adapter").notNull(),
    tool: text("tool").notNull(),
    diagnostic: text("diagnostic").default("").notNull(),
    durationMs: integer("duration_ms").default(0).notNull(),
    requirementRefs: jsonb("requirement_refs").$type<readonly string[]>().default([]).notNull(),
    artifactRefs: jsonb("artifact_refs").$type<readonly string[]>().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("evidence_run_key_unique").on(table.runId, table.evidenceKey),
    index("evidence_organization_created_idx").on(table.organizationId, table.createdAt),
    index("evidence_project_idx").on(table.projectId),
  ],
);

export const finding = pgTable(
  "finding",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    runId: uuid("run_id")
      .notNull()
      .references(() => verificationRun.id, { onDelete: "cascade" }),
    contractId: uuid("contract_id").references(() => qualityContract.id, {
      onDelete: "set null",
    }),
    findingKey: text("finding_key").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    severity: text("severity").$type<FindingSeverity>().notNull(),
    status: text("status").default("open").notNull(),
    blocking: boolean("blocking").default(false).notNull(),
    owner: text("owner").default("Unassigned").notNull(),
    requirementRef: text("requirement_ref"),
    expected: text("expected").default("").notNull(),
    actual: text("actual").notNull(),
    explanation: text("explanation").default("").notNull(),
    reproduction: jsonb("reproduction")
      .$type<{ readonly command: string; readonly steps: readonly string[] }>()
      .notNull(),
    evidenceIds: jsonb("evidence_ids").$type<readonly string[]>().default([]).notNull(),
    artifactRefs: jsonb("artifact_refs").$type<readonly string[]>().default([]).notNull(),
    occurrenceCount: integer("occurrence_count").default(1).notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("finding_run_key_unique").on(table.runId, table.findingKey),
    index("finding_organization_status_idx").on(table.organizationId, table.status),
    index("finding_project_status_idx").on(table.projectId, table.status),
  ],
);

export const requirementCoverage = pgTable(
  "requirement_coverage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => project.id, { onDelete: "cascade" }),
    contractId: uuid("contract_id").references(() => qualityContract.id, {
      onDelete: "cascade",
    }),
    areaKey: text("area_key").notNull(),
    label: text("label").notNull(),
    color: text("color").$type<"coral" | "indigo" | "mint" | "ochre">().notNull(),
    covered: integer("covered").default(0).notNull(),
    total: integer("total").default(0).notNull(),
    evidenceCount: integer("evidence_count").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("requirement_coverage_organization_area_unique").on(
      table.organizationId,
      table.areaKey,
    ),
    index("requirement_coverage_project_idx").on(table.projectId),
  ],
);

export const qaMemory = pgTable(
  "qa_memory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
    memoryKey: text("memory_key").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    rootCause: text("root_cause").notNull(),
    severity: text("severity").$type<FindingSeverity>().notNull(),
    type: text("type").default("bug").notNull(),
    source: text("source").default("manual").notNull(),
    status: text("status").default("active").notNull(),
    tags: jsonb("tags").$type<readonly string[]>().default([]).notNull(),
    relatedContracts: jsonb("related_contracts").$type<readonly string[]>().default([]).notNull(),
    relatedFiles: jsonb("related_files").$type<readonly string[]>().default([]).notNull(),
    regressionTests: jsonb("regression_tests")
      .$type<
        readonly {
          readonly adapter: "playwright" | "vitest";
          readonly id: string;
          readonly path: string;
          readonly requirementRefs: readonly string[];
        }[]
      >()
      .default([])
      .notNull(),
    regressionCount: integer("regression_count").default(0).notNull(),
    lastMatchedAt: timestamp("last_matched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("qa_memory_organization_key_unique").on(table.organizationId, table.memoryKey),
    index("qa_memory_organization_matched_idx").on(table.organizationId, table.lastMatchedAt),
    index("qa_memory_project_idx").on(table.projectId),
  ],
);

export type ProductionFeedbackStatus = "open" | "resolved";
export type FeedbackCandidateStatus = "approved" | "pending" | "rejected";

export const productionFeedback = pgTable(
  "production_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    tokenId: uuid("token_id").references(() => projectIngestToken.id, { onDelete: "set null" }),
    verificationRunId: uuid("verification_run_id").references(() => verificationRun.id, {
      onDelete: "set null",
    }),
    source: text("source").$type<"generic">().notNull(),
    eventType: text("event_type").notNull(),
    fingerprint: text("fingerprint").notNull(),
    severity: text("severity").$type<FindingSeverity>().notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    exceptionType: text("exception_type").notNull(),
    environment: text("environment").notNull(),
    release: text("release"),
    commitSha: text("commit_sha"),
    branch: text("branch"),
    frames: jsonb("frames")
      .$type<
        readonly {
          readonly column?: number;
          readonly file: string;
          readonly function?: string;
          readonly line?: number;
        }[]
      >()
      .default([])
      .notNull(),
    relatedFiles: jsonb("related_files").$type<readonly string[]>().default([]).notNull(),
    requirementRefs: jsonb("requirement_refs").$type<readonly string[]>().default([]).notNull(),
    tags: jsonb("tags").$type<readonly string[]>().default([]).notNull(),
    attributes: jsonb("attributes")
      .$type<Readonly<Record<string, boolean | number | string>>>()
      .default({})
      .notNull(),
    reproductionProposal: jsonb("reproduction_proposal")
      .$type<{ readonly observed: string; readonly steps: readonly string[] }>()
      .notNull(),
    regressionProposal: jsonb("regression_proposal")
      .$type<{
        readonly objective: string;
        readonly requirementRefs: readonly string[];
        readonly status: "proposed";
        readonly suggestedAdapter?: "playwright" | "vitest";
        readonly suggestedPath?: string;
      }>()
      .notNull(),
    occurrenceCount: integer("occurrence_count").default(1).notNull(),
    status: text("status").$type<ProductionFeedbackStatus>().default("open").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    firstReceivedAt: timestamp("first_received_at", { withTimezone: true }).defaultNow().notNull(),
    lastReceivedAt: timestamp("last_received_at", { withTimezone: true }).defaultNow().notNull(),
    retentionUntil: timestamp("retention_until", { withTimezone: true }).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("production_feedback_project_fingerprint_unique").on(
      table.projectId,
      table.source,
      table.fingerprint,
    ),
    index("production_feedback_organization_received_idx").on(
      table.organizationId,
      table.lastReceivedAt,
    ),
    index("production_feedback_project_commit_idx").on(table.projectId, table.commitSha),
    index("production_feedback_retention_idx").on(table.retentionUntil),
    check("production_feedback_occurrence_positive", sql`${table.occurrenceCount} > 0`),
  ],
);

export const productionFeedbackDelivery = pgTable(
  "production_feedback_delivery",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => productionFeedback.id, { onDelete: "cascade" }),
    tokenId: uuid("token_id").references(() => projectIngestToken.id, { onDelete: "set null" }),
    source: text("source").$type<"generic">().notNull(),
    eventKey: text("event_key").notNull(),
    payloadHash: text("payload_hash").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("production_feedback_delivery_project_event_unique").on(
      table.projectId,
      table.source,
      table.eventKey,
    ),
    index("production_feedback_delivery_feedback_idx").on(table.feedbackId),
    index("production_feedback_delivery_received_idx").on(table.receivedAt),
  ],
);

export const productionFeedbackContract = pgTable(
  "production_feedback_contract",
  {
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => productionFeedback.id, { onDelete: "cascade" }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => qualityContract.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("production_feedback_contract_unique").on(table.feedbackId, table.contractId),
    index("production_feedback_contract_contract_idx").on(table.contractId),
  ],
);

export const qaMemoryCandidate = pgTable(
  "qa_memory_candidate",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => productionFeedback.id, { onDelete: "cascade" }),
    memoryId: uuid("memory_id").references(() => qaMemory.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    rootCause: text("root_cause"),
    severity: text("severity").$type<FindingSeverity>().notNull(),
    status: text("status").$type<FeedbackCandidateStatus>().default("pending").notNull(),
    relatedContracts: jsonb("related_contracts").$type<readonly string[]>().default([]).notNull(),
    relatedFiles: jsonb("related_files").$type<readonly string[]>().default([]).notNull(),
    reproductionProposal: jsonb("reproduction_proposal")
      .$type<{ readonly observed: string; readonly steps: readonly string[] }>()
      .notNull(),
    regressionProposal: jsonb("regression_proposal")
      .$type<{
        readonly objective: string;
        readonly requirementRefs: readonly string[];
        readonly status: "proposed";
        readonly suggestedAdapter?: "playwright" | "vitest";
        readonly suggestedPath?: string;
      }>()
      .notNull(),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("qa_memory_candidate_feedback_unique").on(table.feedbackId),
    index("qa_memory_candidate_organization_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("qa_memory_candidate_project_idx").on(table.projectId),
  ],
);

export const feedbackIngestionRateWindow = pgTable(
  "feedback_ingestion_rate_window",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenId: uuid("token_id")
      .notNull()
      .references(() => projectIngestToken.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
    requestCount: integer("request_count").default(1).notNull(),
  },
  (table) => [
    uniqueIndex("feedback_rate_token_window_unique").on(table.tokenId, table.windowStartedAt),
    index("feedback_rate_window_idx").on(table.windowStartedAt),
    check("feedback_rate_count_positive", sql`${table.requestCount} > 0`),
  ],
);

export const productionFeedbackAudit = pgTable(
  "production_feedback_audit",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    feedbackId: uuid("feedback_id").references(() => productionFeedback.id, {
      onDelete: "set null",
    }),
    tokenId: uuid("token_id").references(() => projectIngestToken.id, { onDelete: "set null" }),
    eventKey: text("event_key").notNull(),
    payloadHash: text("payload_hash").notNull(),
    action: text("action").$type<"accepted" | "conflict" | "replayed">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("production_feedback_audit_project_created_idx").on(table.projectId, table.createdAt),
    index("production_feedback_audit_feedback_idx").on(table.feedbackId),
  ],
);
