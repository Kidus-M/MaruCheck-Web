import { createHash } from "node:crypto";

export const PRODUCTION_FEEDBACK_SCHEMA_VERSION = 1;
export const PRODUCTION_FEEDBACK_RETENTION_DAYS = 90;
export const PRODUCTION_FEEDBACK_RATE_LIMIT = 60;

export type FeedbackSeverity = "critical" | "high" | "info" | "low" | "medium";
export type FeedbackEventType = "exception" | "failed-job" | "http-error";

export interface ProductionFeedbackEnvelope {
  readonly event: ProductionFeedbackEvent;
  readonly schemaVersion: 1;
}

export interface ProductionFeedbackEvent {
  readonly attributes: Readonly<Record<string, boolean | number | string>>;
  readonly branch?: string;
  readonly commitSha?: string;
  readonly contractRefs: readonly string[];
  readonly environment: string;
  readonly exception: {
    readonly frames: readonly {
      readonly column?: number;
      readonly file: string;
      readonly function?: string;
      readonly line?: number;
    }[];
    readonly message: string;
    readonly type: string;
  };
  readonly fingerprint: string;
  readonly id: string;
  readonly occurredAt: Date;
  readonly regression?: {
    readonly objective: string;
    readonly requirementRefs: readonly string[];
    readonly suggestedAdapter?: "playwright" | "vitest";
    readonly suggestedPath?: string;
  };
  readonly relatedFiles: readonly string[];
  readonly release?: string;
  readonly reproduction: {
    readonly observed: string;
    readonly steps: readonly string[];
  };
  readonly requirementRefs: readonly string[];
  readonly severity: FeedbackSeverity;
  readonly source: "generic";
  readonly tags: readonly string[];
  readonly title: string;
  readonly type: FeedbackEventType;
}

export interface FeedbackCandidateDraft {
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
  readonly rootCause: null;
  readonly status: "pending";
  readonly summary: string;
  readonly title: string;
}

export type FeedbackReviewInput =
  | { readonly decision: "reject" }
  | {
      readonly decision: "approve";
      readonly regression: {
        readonly adapter: "playwright" | "vitest";
        readonly id: string;
        readonly path: string;
      };
      readonly rootCause: string;
    };

export class FeedbackValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "FeedbackValidationError";
  }
}

const EVENT_FIELDS = [
  "attributes",
  "branch",
  "commitSha",
  "contractRefs",
  "environment",
  "exception",
  "fingerprint",
  "id",
  "occurredAt",
  "regression",
  "relatedFiles",
  "release",
  "reproduction",
  "requirementRefs",
  "severity",
  "source",
  "tags",
  "title",
  "type",
] as const;
const FILE_PATH = /^(?![A-Za-z]:[\\/])(?![/\\])(?!.*(?:^|[/\\])\.\.(?:[/\\]|$))[^\0]+$/u;
const REFERENCE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}(?:#[A-Za-z0-9][A-Za-z0-9._-]{0,199})?$/u;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/u;
const COMMIT_SHA = /^[a-fA-F0-9]{7,64}$/u;

/** Parse the generic, source-free production feedback envelope. */
export function parseProductionFeedbackEnvelope(
  input: unknown,
  options: { readonly now?: Date } = {},
): ProductionFeedbackEnvelope {
  const root = object(input, "request", ["event", "schemaVersion"]);
  if (root.schemaVersion !== PRODUCTION_FEEDBACK_SCHEMA_VERSION) {
    throw new FeedbackValidationError("schemaVersion must be 1.");
  }
  const value = object(root.event, "event", EVENT_FIELDS);
  const source = oneOf(value.source, "event.source", ["generic"] as const);
  const occurredAt = date(value.occurredAt, "event.occurredAt");
  const now = options.now ?? new Date();
  if (occurredAt.getTime() > now.getTime() + 5 * 60_000) {
    throw new FeedbackValidationError("event.occurredAt cannot be more than 5 minutes ahead.");
  }

  return {
    event: {
      attributes: attributes(value.attributes),
      ...(value.branch === undefined ? {} : { branch: string(value.branch, "event.branch", 200) }),
      ...(value.commitSha === undefined
        ? {}
        : { commitSha: pattern(value.commitSha, "event.commitSha", 64, COMMIT_SHA) }),
      contractRefs: referenceArray(value.contractRefs, "event.contractRefs", 20),
      environment: string(value.environment, "event.environment", 100),
      exception: exception(value.exception),
      fingerprint: pattern(value.fingerprint, "event.fingerprint", 200, IDENTIFIER),
      id: pattern(value.id, "event.id", 200, IDENTIFIER),
      occurredAt,
      ...(value.regression === undefined ? {} : { regression: regression(value.regression) }),
      relatedFiles: pathArray(value.relatedFiles, "event.relatedFiles", 50),
      ...(value.release === undefined
        ? {}
        : { release: string(value.release, "event.release", 200) }),
      reproduction: reproduction(value.reproduction),
      requirementRefs: referenceArray(value.requirementRefs, "event.requirementRefs", 50),
      severity: oneOf(value.severity, "event.severity", [
        "critical",
        "high",
        "info",
        "low",
        "medium",
      ] as const),
      source,
      tags: stringArray(value.tags, "event.tags", 20, 80),
      title: string(value.title, "event.title", 300),
      type: oneOf(value.type, "event.type", ["exception", "failed-job", "http-error"] as const),
    },
    schemaVersion: PRODUCTION_FEEDBACK_SCHEMA_VERSION,
  };
}

export function productionFeedbackPayloadHash(value: ProductionFeedbackEnvelope): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

export function decideFeedbackDelivery(
  existingPayloadHash: string | undefined,
  payloadHash: string,
): "accept" | "conflict" | "replay" {
  if (existingPayloadHash === undefined) return "accept";
  return existingPayloadHash === payloadHash ? "replay" : "conflict";
}

export function deriveFeedbackCandidate(event: ProductionFeedbackEvent): FeedbackCandidateDraft {
  return {
    regressionProposal: {
      objective:
        event.regression?.objective ?? `Reproduce production failure: ${event.title}`,
      requirementRefs: event.regression?.requirementRefs ?? event.requirementRefs,
      status: "proposed",
      ...(event.regression?.suggestedAdapter === undefined
        ? {}
        : { suggestedAdapter: event.regression.suggestedAdapter }),
      ...(event.regression?.suggestedPath === undefined
        ? {}
        : { suggestedPath: event.regression.suggestedPath }),
    },
    reproductionProposal: event.reproduction,
    rootCause: null,
    status: "pending",
    summary: event.exception.message,
    title: event.title,
  };
}

export function parseFeedbackReviewInput(value: unknown): FeedbackReviewInput {
  const input = object(value, "review", [
    "decision",
    "regressionAdapter",
    "regressionId",
    "regressionPath",
    "rootCause",
  ]);
  const decision = oneOf(input.decision, "review.decision", ["approve", "reject"] as const);
  if (decision === "reject") return { decision };
  return {
    decision,
    regression: {
      adapter: oneOf(input.regressionAdapter, "review.regressionAdapter", [
        "playwright",
        "vitest",
      ] as const),
      id: pattern(
        input.regressionId,
        "review.regressionId",
        100,
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/u,
      ),
      path: projectPath(input.regressionPath, "review.regressionPath"),
    },
    rootCause: string(input.rootCause, "review.rootCause", 5_000),
  };
}

function exception(value: unknown): ProductionFeedbackEvent["exception"] {
  const input = object(value, "event.exception", ["frames", "message", "type"]);
  const frames = array(input.frames, "event.exception.frames", 50).map((entry, index) => {
    const path = `event.exception.frames[${index}]`;
    const frame = object(entry, path, ["column", "file", "function", "line"]);
    return {
      ...(frame.column === undefined
        ? {}
        : { column: integer(frame.column, `${path}.column`, 1, 10_000_000) }),
      file: projectPath(frame.file, `${path}.file`),
      ...(frame.function === undefined
        ? {}
        : { function: string(frame.function, `${path}.function`, 300) }),
      ...(frame.line === undefined
        ? {}
        : { line: integer(frame.line, `${path}.line`, 1, 10_000_000) }),
    };
  });
  return {
    frames,
    message: string(input.message, "event.exception.message", 10_000),
    type: string(input.type, "event.exception.type", 300),
  };
}

function reproduction(value: unknown): ProductionFeedbackEvent["reproduction"] {
  const input = object(value, "event.reproduction", ["observed", "steps"]);
  return {
    observed: string(input.observed, "event.reproduction.observed", 5_000),
    steps: stringArray(input.steps, "event.reproduction.steps", 20, 1_000),
  };
}

function regression(value: unknown): NonNullable<ProductionFeedbackEvent["regression"]> {
  const input = object(value, "event.regression", [
    "objective",
    "requirementRefs",
    "suggestedAdapter",
    "suggestedPath",
  ]);
  return {
    objective: string(input.objective, "event.regression.objective", 2_000),
    requirementRefs: referenceArray(
      input.requirementRefs,
      "event.regression.requirementRefs",
      50,
    ),
    ...(input.suggestedAdapter === undefined
      ? {}
      : {
          suggestedAdapter: oneOf(input.suggestedAdapter, "event.regression.suggestedAdapter", [
            "playwright",
            "vitest",
          ] as const),
        }),
    ...(input.suggestedPath === undefined
      ? {}
      : { suggestedPath: projectPath(input.suggestedPath, "event.regression.suggestedPath") }),
  };
}

function attributes(value: unknown): Readonly<Record<string, boolean | number | string>> {
  const input = object(value, "event.attributes");
  if (Object.keys(input).length > 50) {
    throw new FeedbackValidationError("event.attributes has more than 50 entries.");
  }
  return Object.fromEntries(
    Object.entries(input).map(([key, entry]) => {
      if (!/^[A-Za-z][A-Za-z0-9._-]{0,79}$/u.test(key)) {
        throw new FeedbackValidationError(`event.attributes contains an invalid key: ${key}.`);
      }
      if (
        (typeof entry !== "string" || entry.length > 1_000) &&
        (typeof entry !== "number" || !Number.isFinite(entry)) &&
        typeof entry !== "boolean"
      ) {
        throw new FeedbackValidationError(
          `event.attributes.${key} must be a bounded string, finite number, or boolean.`,
        );
      }
      return [key, entry as boolean | number | string];
    }),
  );
}

function object(
  value: unknown,
  path: string,
  allowedFields?: readonly string[],
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new FeedbackValidationError(`${path} must be an object.`);
  }
  const result = value as Record<string, unknown>;
  const unsupported =
    allowedFields === undefined
      ? []
      : Object.keys(result).filter((field) => !allowedFields.includes(field));
  if (unsupported.length > 0) {
    throw new FeedbackValidationError(`${path} contains unsupported field: ${unsupported[0]}.`);
  }
  return result;
}

function array(value: unknown, path: string, maximum: number): readonly unknown[] {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new FeedbackValidationError(`${path} must be an array with at most ${maximum} items.`);
  }
  return value;
}

function string(value: unknown, path: string, maximum: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maximum) {
    throw new FeedbackValidationError(
      `${path} must be a non-empty string of at most ${maximum} characters.`,
    );
  }
  return value.trim();
}

function pattern(value: unknown, path: string, maximum: number, regex: RegExp): string {
  const parsed = string(value, path, maximum);
  if (!regex.test(parsed)) throw new FeedbackValidationError(`${path} has an invalid format.`);
  return parsed;
}

function stringArray(
  value: unknown,
  path: string,
  maximumItems: number,
  maximumLength: number,
): readonly string[] {
  const result = array(value, path, maximumItems).map((item, index) =>
    string(item, `${path}[${index}]`, maximumLength),
  );
  if (new Set(result).size !== result.length) {
    throw new FeedbackValidationError(`${path} contains duplicate values.`);
  }
  return result;
}

function referenceArray(value: unknown, path: string, maximum: number): readonly string[] {
  return stringArray(value, path, maximum, 400).map((reference, index) => {
    if (!REFERENCE.test(reference)) {
      throw new FeedbackValidationError(`${path}[${index}] has an invalid reference format.`);
    }
    return reference;
  });
}

function pathArray(value: unknown, path: string, maximum: number): readonly string[] {
  return stringArray(value, path, maximum, 500).map((entry, index) =>
    projectPath(entry, `${path}[${index}]`),
  );
}

function projectPath(value: unknown, path: string): string {
  const parsed = string(value, path, 500).replaceAll("\\", "/");
  if (!FILE_PATH.test(parsed)) {
    throw new FeedbackValidationError(`${path} must be a project-relative path.`);
  }
  return parsed;
}

function integer(value: unknown, path: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new FeedbackValidationError(`${path} must be an integer from ${minimum} to ${maximum}.`);
  }
  return value as number;
}

function date(value: unknown, path: string): Date {
  const raw = string(value, path, 100);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== raw) {
    throw new FeedbackValidationError(`${path} must be a canonical ISO timestamp.`);
  }
  return parsed;
}

function oneOf<const T extends readonly string[]>(
  value: unknown,
  path: string,
  allowed: T,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new FeedbackValidationError(`${path} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T[number];
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]),
  );
}
