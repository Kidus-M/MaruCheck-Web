import "server-only";

export interface IngestEnvelope {
  readonly branch: string;
  readonly commitSha: string;
  readonly completedAt: Date;
  readonly report: {
    readonly evidence: readonly IngestEvidence[];
    readonly findings: readonly IngestFinding[];
    readonly gate: { readonly reasons: readonly string[]; readonly status: "blocked" | "passed" };
    readonly generatedAt: Date;
    readonly projectName: string;
    readonly requirementEvidence: readonly IngestRequirementEvidence[];
    readonly risk: { readonly level: string; readonly score: number };
    readonly runId: string;
  };
  readonly startedAt: Date;
  readonly title: string;
}

export interface IngestEvidence {
  readonly adapter: string;
  readonly artifactRefs: readonly string[];
  readonly createdAt: Date;
  readonly diagnostic: string;
  readonly durationMs: number;
  readonly id: string;
  readonly requirementRefs: readonly string[];
  readonly status: "failed" | "inconclusive" | "passed";
  readonly tool: string;
  readonly type: string;
}

export interface IngestFinding {
  readonly actual: string;
  readonly artifactRefs: readonly string[];
  readonly blocking: boolean;
  readonly contractId?: string;
  readonly evidenceIds: readonly string[];
  readonly expected?: string;
  readonly explanation: string;
  readonly id: string;
  readonly kind: string;
  readonly reproduction: { readonly command: string; readonly steps: readonly string[] };
  readonly requirementRef?: string;
  readonly severity: "critical" | "high" | "info" | "low" | "medium";
  readonly status: string;
  readonly title: string;
}

export interface IngestRequirementEvidence {
  readonly contractId: string;
  readonly contractTitle: string;
  readonly evidenceIds: readonly string[];
  readonly requirementRef: string;
  readonly status: "failed" | "inconclusive" | "passed" | "unverified";
}

export class IngestionError extends Error {}

/** Parse the versioned CLI verification-report envelope without importing the CLI repository. */
export function parseIngestEnvelope(input: unknown): IngestEnvelope {
  const envelope = object(input, "request");
  if (envelope.schemaVersion !== 1) throw new IngestionError("schemaVersion must be 1.");
  const report = object(envelope.report, "report");
  if (report.schemaVersion !== 1) throw new IngestionError("report.schemaVersion must be 1.");
  const project = object(report.project, "report.project");
  const gate = object(report.gate, "report.gate");
  const risk = object(report.risk, "report.risk");
  const generatedAt = date(report.generatedAt, "report.generatedAt");
  const startedAt = envelope.startedAt ? date(envelope.startedAt, "startedAt") : generatedAt;
  const completedAt = envelope.completedAt
    ? date(envelope.completedAt, "completedAt")
    : generatedAt;

  return {
    branch: string(envelope.branch, "branch", 200),
    commitSha: string(envelope.commitSha, "commitSha", 100),
    completedAt,
    report: {
      evidence: array(report.evidence, "report.evidence", 500).map(parseEvidence),
      findings: array(report.findings, "report.findings", 250).map(parseFinding),
      gate: {
        reasons: stringArray(gate.reasons, "report.gate.reasons", 50, 1_000),
        status: oneOf(gate.status, "report.gate.status", ["blocked", "passed"] as const),
      },
      generatedAt,
      projectName: string(project.name, "report.project.name", 200),
      requirementEvidence: array(
        report.requirementEvidence,
        "report.requirementEvidence",
        1_000,
      ).map(parseRequirementEvidence),
      risk: {
        level: string(risk.level, "report.risk.level", 30),
        score: integer(risk.score, "report.risk.score", 0, 100),
      },
      runId: string(report.runId, "report.runId", 200),
    },
    startedAt,
    title: string(envelope.title, "title", 300),
  };
}

function parseEvidence(input: unknown, index: number): IngestEvidence {
  const value = object(input, `report.evidence[${index}]`);
  return {
    adapter: string(value.adapter, `report.evidence[${index}].adapter`, 100),
    artifactRefs: stringArray(
      value.artifactRefs,
      `report.evidence[${index}].artifactRefs`,
      100,
      500,
    ),
    createdAt: date(value.createdAt, `report.evidence[${index}].createdAt`),
    diagnostic: optionalString(value.diagnostic, 10_000),
    durationMs: integer(value.durationMs, `report.evidence[${index}].durationMs`, 0, 86_400_000),
    id: string(value.id, `report.evidence[${index}].id`, 200),
    requirementRefs: stringArray(
      value.requirementRefs,
      `report.evidence[${index}].requirementRefs`,
      100,
      300,
    ),
    status: oneOf(value.status, `report.evidence[${index}].status`, [
      "failed",
      "inconclusive",
      "passed",
    ] as const),
    tool: string(value.tool, `report.evidence[${index}].tool`, 200),
    type: string(value.type, `report.evidence[${index}].type`, 100),
  };
}

function parseFinding(input: unknown, index: number): IngestFinding {
  const value = object(input, `report.findings[${index}]`);
  const reproduction = object(value.reproduction, `report.findings[${index}].reproduction`);
  return {
    actual: string(value.actual, `report.findings[${index}].actual`, 10_000),
    artifactRefs: stringArray(
      value.artifactRefs,
      `report.findings[${index}].artifactRefs`,
      100,
      500,
    ),
    blocking: boolean(value.blocking, `report.findings[${index}].blocking`),
    contractId: optionalString(value.contractId, 200) || undefined,
    evidenceIds: stringArray(value.evidenceIds, `report.findings[${index}].evidenceIds`, 100, 200),
    expected: optionalString(value.expected, 10_000) || undefined,
    explanation: optionalString(value.explanation, 10_000),
    id: string(value.id, `report.findings[${index}].id`, 200),
    kind: string(value.kind, `report.findings[${index}].kind`, 100),
    reproduction: {
      command: string(
        reproduction.command,
        `report.findings[${index}].reproduction.command`,
        1_000,
      ),
      steps: stringArray(
        reproduction.steps,
        `report.findings[${index}].reproduction.steps`,
        50,
        1_000,
      ),
    },
    requirementRef: optionalString(value.requirementRef, 300) || undefined,
    severity: oneOf(value.severity, `report.findings[${index}].severity`, [
      "critical",
      "high",
      "info",
      "low",
      "medium",
    ] as const),
    status: string(value.status, `report.findings[${index}].status`, 100),
    title: string(value.title, `report.findings[${index}].title`, 500),
  };
}

function parseRequirementEvidence(input: unknown, index: number): IngestRequirementEvidence {
  const value = object(input, `report.requirementEvidence[${index}]`);
  return {
    contractId: string(value.contractId, `report.requirementEvidence[${index}].contractId`, 200),
    contractTitle: string(
      value.contractTitle,
      `report.requirementEvidence[${index}].contractTitle`,
      500,
    ),
    evidenceIds: stringArray(
      value.evidenceIds,
      `report.requirementEvidence[${index}].evidenceIds`,
      100,
      200,
    ),
    requirementRef: string(
      value.requirementRef,
      `report.requirementEvidence[${index}].requirementRef`,
      300,
    ),
    status: oneOf(value.status, `report.requirementEvidence[${index}].status`, [
      "failed",
      "inconclusive",
      "passed",
      "unverified",
    ] as const),
  };
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new IngestionError(`${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function array(value: unknown, path: string, maximum: number): readonly unknown[] {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new IngestionError(`${path} must be an array with at most ${maximum} items.`);
  }
  return value;
}

function string(value: unknown, path: string, maximum: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new IngestionError(
      `${path} must be a non-empty string of at most ${maximum} characters.`,
    );
  }
  return value;
}

function optionalString(value: unknown, maximum: number): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > maximum) {
    throw new IngestionError(`A string value exceeds its ${maximum} character limit.`);
  }
  return value;
}

function stringArray(
  value: unknown,
  path: string,
  maximumItems: number,
  maximumLength: number,
): readonly string[] {
  return array(value, path, maximumItems).map((item, index) =>
    string(item, `${path}[${index}]`, maximumLength),
  );
}

function date(value: unknown, path: string): Date {
  const parsed = new Date(string(value, path, 100));
  if (Number.isNaN(parsed.getTime())) throw new IngestionError(`${path} must be an ISO timestamp.`);
  return parsed;
}

function integer(value: unknown, path: string, minimum: number, maximum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new IngestionError(`${path} must be an integer between ${minimum} and ${maximum}.`);
  }
  return value as number;
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new IngestionError(`${path} must be a boolean.`);
  return value;
}

function oneOf<const T extends readonly string[]>(
  value: unknown,
  path: string,
  allowed: T,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new IngestionError(`${path} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T[number];
}
