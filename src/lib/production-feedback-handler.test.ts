import { describe, expect, it, vi } from "vitest";
import {
  FeedbackServiceError,
  handleProductionFeedbackRequest,
  type ProductionFeedbackHandlerDependencies,
} from "./production-feedback-handler";

const NOW = new Date("2026-08-21T08:00:00.000Z");
const TOKEN = `maru_${"a".repeat(43)}`;

function payload() {
  return {
    event: {
      attributes: {},
      contractRefs: ["invoice-access"],
      environment: "production",
      exception: {
        frames: [],
        message: "Invoice lookup crossed an organization boundary.",
        type: "AuthorizationBoundaryError",
      },
      fingerprint: "invoice-cross-tenant-read",
      id: "evt-prod-0001",
      occurredAt: "2026-08-21T07:58:00.000Z",
      relatedFiles: ["src/invoices/read-invoice.ts"],
      reproduction: { observed: "Wrong tenant invoice returned.", steps: [] },
      requirementRefs: ["invoice-access#INV-001"],
      severity: "critical",
      source: "generic",
      tags: [],
      title: "Cross-tenant invoice read",
      type: "exception",
    },
    schemaVersion: 1,
  };
}

function request(
  body: string = JSON.stringify(payload()),
  headers: Record<string, string> = {},
): Request {
  return new Request("https://app.marucheck.dev/api/v1/production-events", {
    body,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
      "idempotency-key": "evt-prod-0001",
      ...headers,
    },
    method: "POST",
  });
}

function dependencies(
  overrides: Partial<ProductionFeedbackHandlerDependencies> = {},
): ProductionFeedbackHandlerDependencies {
  return {
    authenticate: vi.fn().mockResolvedValue({
      organizationId: "org-1",
      projectId: "project-1",
      tokenId: "token-1",
    }),
    ingest: vi.fn().mockResolvedValue({
      candidateId: "candidate-1",
      feedbackId: "feedback-1",
      occurrenceCount: 1,
      status: "accepted",
    }),
    now: () => NOW,
    requestId: () => "req-test-1",
    ...overrides,
  };
}

describe("production feedback route boundary", () => {
  it("authenticates, validates, and returns a located resource for a new event", async () => {
    const deps = dependencies();
    const response = await handleProductionFeedbackRequest(request(), deps);

    expect(response.status).toBe(201);
    expect(response.headers.get("location")).toBe("/api/v1/production-events/feedback-1");
    expect(response.headers.get("x-request-id")).toBe("req-test-1");
    await expect(response.json()).resolves.toMatchObject({
      accepted: true,
      candidateId: "candidate-1",
      feedbackId: "feedback-1",
      replayed: false,
      schemaVersion: 1,
    });
    expect(deps.ingest).toHaveBeenCalledOnce();
  });

  it("returns 200 for an idempotent replay without claiming a new occurrence", async () => {
    const response = await handleProductionFeedbackRequest(
      request(),
      dependencies({
        ingest: vi.fn().mockResolvedValue({
          candidateId: "candidate-1",
          feedbackId: "feedback-1",
          occurrenceCount: 1,
          status: "replayed",
        }),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ replayed: true });
  });

  it.each([
    ["missing bearer token", request(undefined, { authorization: "" }), 401],
    ["missing idempotency key", request(undefined, { "idempotency-key": "" }), 400],
    ["mismatched idempotency key", request(undefined, { "idempotency-key": "other" }), 409],
    ["invalid JSON", request("{"), 400],
  ])("returns a problem response for %s", async (_name, input, status) => {
    const response = await handleProductionFeedbackRequest(input, dependencies());
    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    await expect(response.json()).resolves.toMatchObject({ status, instance: "req-test-1" });
  });

  it("rejects a declared or observed body above 256 KB", async () => {
    const tooLarge = "x".repeat(256_001);
    const observed = await handleProductionFeedbackRequest(request(tooLarge), dependencies());
    const declared = await handleProductionFeedbackRequest(
      request(JSON.stringify(payload()), { "content-length": "256001" }),
      dependencies(),
    );
    expect(observed.status).toBe(413);
    expect(declared.status).toBe(413);
  });

  it.each([
    ["CONFLICT", 409],
    ["RATE_LIMITED", 429],
    ["UNAVAILABLE", 503],
  ] as const)("maps %s service failures safely", async (code, status) => {
    const response = await handleProductionFeedbackRequest(
      request(),
      dependencies({
        ingest: vi.fn().mockRejectedValue(
          new FeedbackServiceError(code, "Safe failure detail.", {
            ...(code === "RATE_LIMITED" ? { retryAfterSeconds: 60 } : {}),
          }),
        ),
      }),
    );
    expect(response.status).toBe(status);
    if (code === "RATE_LIMITED") expect(response.headers.get("retry-after")).toBe("60");
    await expect(response.json()).resolves.toMatchObject({ detail: "Safe failure detail.", status });
  });
});
