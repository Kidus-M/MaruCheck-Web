import { randomUUID } from "node:crypto";
import {
  FeedbackValidationError,
  parseProductionFeedbackEnvelope,
  productionFeedbackPayloadHash,
  type ProductionFeedbackEnvelope,
} from "./production-feedback";

const MAX_BODY_BYTES = 256_000;

export interface FeedbackCredential {
  readonly organizationId: string;
  readonly projectId: string;
  readonly tokenId: string;
}

export interface FeedbackIngestionResult {
  readonly candidateId: string;
  readonly feedbackId: string;
  readonly occurrenceCount: number;
  readonly status: "accepted" | "replayed";
}

export interface ProductionFeedbackHandlerDependencies {
  readonly authenticate: (rawToken: string, now: Date) => Promise<FeedbackCredential | undefined>;
  readonly ingest: (
    credential: FeedbackCredential,
    envelope: ProductionFeedbackEnvelope,
    payloadHash: string,
    now: Date,
  ) => Promise<FeedbackIngestionResult>;
  readonly logError?: (error: unknown, requestId: string) => void;
  readonly now?: () => Date;
  readonly requestId?: () => string;
}

export type FeedbackServiceErrorCode = "CONFLICT" | "RATE_LIMITED" | "UNAVAILABLE";

export class FeedbackServiceError extends Error {
  public readonly retryAfterSeconds?: number;

  public constructor(
    public readonly code: FeedbackServiceErrorCode,
    message: string,
    options: { readonly cause?: unknown; readonly retryAfterSeconds?: number } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "FeedbackServiceError";
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

/** Handle the public production-event contract independently from its database adapter. */
export async function handleProductionFeedbackRequest(
  request: Request,
  dependencies: ProductionFeedbackHandlerDependencies,
): Promise<Response> {
  const requestId = dependencies.requestId?.() ?? `req_${randomUUID()}`;
  const now = dependencies.now?.() ?? new Date();
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return problem(413, "payload-too-large", "Request body exceeds 256 KB.", requestId);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return problem(
      401,
      "authentication-required",
      "A project bearer token is required.",
      requestId,
      {
        "www-authenticate": 'Bearer realm="production-feedback"',
      },
    );
  }
  const rawToken = authorization.slice("Bearer ".length).trim();
  if (!/^maru_[A-Za-z0-9_-]{20,123}$/u.test(rawToken)) {
    return problem(401, "invalid-token", "Project token is invalid.", requestId);
  }
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey) {
    return problem(400, "idempotency-key-required", "Idempotency-Key is required.", requestId);
  }
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return problem(
      415,
      "unsupported-media-type",
      "Content-Type must be application/json.",
      requestId,
    );
  }

  let envelope: ProductionFeedbackEnvelope;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return problem(413, "payload-too-large", "Request body exceeds 256 KB.", requestId);
    }
    envelope = parseProductionFeedbackEnvelope(JSON.parse(body), { now });
  } catch (error) {
    return problem(
      400,
      "invalid-production-event",
      error instanceof FeedbackValidationError || error instanceof SyntaxError
        ? error.message
        : "The production event could not be parsed.",
      requestId,
    );
  }

  if (idempotencyKey !== envelope.event.id) {
    return problem(
      409,
      "idempotency-key-mismatch",
      "Idempotency-Key must exactly match event.id.",
      requestId,
    );
  }

  try {
    const credential = await dependencies.authenticate(rawToken, now);
    if (credential === undefined) {
      return problem(
        401,
        "invalid-token",
        "Project token is invalid, expired, or revoked.",
        requestId,
      );
    }
    const result = await dependencies.ingest(
      credential,
      envelope,
      productionFeedbackPayloadHash(envelope),
      now,
    );
    return json(
      {
        accepted: true,
        candidateId: result.candidateId,
        feedbackId: result.feedbackId,
        occurrenceCount: result.occurrenceCount,
        replayed: result.status === "replayed",
        schemaVersion: 1,
      },
      result.status === "accepted" ? 201 : 200,
      requestId,
    );
  } catch (error) {
    if (error instanceof FeedbackServiceError) {
      const status = { CONFLICT: 409, RATE_LIMITED: 429, UNAVAILABLE: 503 }[error.code];
      return problem(
        status,
        error.code.toLowerCase().replaceAll("_", "-"),
        error.message,
        requestId,
        error.retryAfterSeconds === undefined
          ? undefined
          : { "retry-after": String(error.retryAfterSeconds) },
      );
    }
    dependencies.logError?.(error, requestId);
    return problem(
      500,
      "production-feedback-failed",
      "The production event could not be persisted.",
      requestId,
    );
  }
}

function json(
  value: unknown,
  status: number,
  requestId: string,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(value), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-request-id": requestId,
      ...headers,
    },
    status,
  });
}

function problem(
  status: number,
  code: string,
  detail: string,
  requestId: string,
  headers: Record<string, string> = {},
): Response {
  const title =
    status === 400
      ? "Invalid request"
      : status === 401
        ? "Unauthorized"
        : status === 409
          ? "Conflict"
          : status === 413
            ? "Payload too large"
            : status === 415
              ? "Unsupported media type"
              : status === 429
                ? "Too many requests"
                : status === 503
                  ? "Service unavailable"
                  : "Production feedback failed";
  return new Response(
    JSON.stringify({
      detail,
      instance: requestId,
      status,
      title,
      type: `https://marucheck.dev/problems/${code}`,
    }),
    {
      headers: {
        "content-type": "application/problem+json; charset=utf-8",
        "x-request-id": requestId,
        ...headers,
      },
      status,
    },
  );
}
