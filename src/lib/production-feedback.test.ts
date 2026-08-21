import { describe, expect, it } from "vitest";
import {
  FeedbackValidationError,
  decideFeedbackDelivery,
  deriveFeedbackCandidate,
  parseProductionFeedbackEnvelope,
  productionFeedbackPayloadHash,
} from "./production-feedback";

const NOW = new Date("2026-08-21T08:00:00.000Z");

function validEnvelope() {
  return {
    event: {
      attributes: { attempt: 3, handled: false, region: "eu-central-1" },
      branch: "main",
      commitSha: "8f2c1a7d5e3b",
      contractRefs: ["invoice-access"],
      environment: "production",
      exception: {
        frames: [
          {
            column: 17,
            file: "src/invoices/read-invoice.ts",
            function: "readInvoice",
            line: 42,
          },
        ],
        message: "Invoice lookup returned a record from another tenant.",
        type: "AuthorizationBoundaryError",
      },
      fingerprint: "invoice-cross-tenant-read",
      id: "evt-prod-0001",
      occurredAt: "2026-08-21T07:58:00.000Z",
      regression: {
        objective: "Prove organization ownership is enforced after authentication.",
        requirementRefs: ["invoice-access#INV-001"],
        suggestedAdapter: "vitest",
        suggestedPath: "tests/invoices/cross-tenant.test.ts",
      },
      relatedFiles: ["src/invoices/read-invoice.ts"],
      release: "web@8f2c1a7",
      reproduction: {
        observed: "Tenant A received tenant B's invoice.",
        steps: ["Create two tenants.", "Read tenant B's invoice as tenant A."],
      },
      requirementRefs: ["invoice-access#INV-001"],
      severity: "critical",
      source: "generic",
      tags: ["authorization", "invoice"],
      title: "Cross-tenant invoice read",
      type: "exception",
    },
    schemaVersion: 1,
  };
}

describe("production feedback parsing", () => {
  it("normalizes a bounded generic production failure without source contents", () => {
    const parsed = parseProductionFeedbackEnvelope(validEnvelope(), { now: NOW });

    expect(parsed.event).toMatchObject({
      commitSha: "8f2c1a7d5e3b",
      fingerprint: "invoice-cross-tenant-read",
      severity: "critical",
      source: "generic",
    });
    expect(parsed.event.exception.frames[0]).toEqual({
      column: 17,
      file: "src/invoices/read-invoice.ts",
      function: "readInvoice",
      line: 42,
    });
    expect(parsed.event).not.toHaveProperty("sourceCode");
  });

  it.each([
    ["unknown source", { source: "sentry" }],
    ["absolute file", { relatedFiles: ["C:/secrets/app.ts"] }],
    ["escaping file", { relatedFiles: ["../app.ts"] }],
    ["invalid commit", { commitSha: "not-a-sha" }],
    ["future event", { occurredAt: "2026-08-21T09:00:00.000Z" }],
  ])("rejects %s", (_name, change) => {
    const input = validEnvelope();
    Object.assign(input.event, change);
    expect(() => parseProductionFeedbackEnvelope(input, { now: NOW })).toThrow(
      FeedbackValidationError,
    );
  });

  it("rejects code, commands, and unknown fields instead of silently storing them", () => {
    const input = validEnvelope() as ReturnType<typeof validEnvelope> & {
      event: ReturnType<typeof validEnvelope>["event"] & { sourceCode?: string };
    };
    input.event.sourceCode = "const secret = process.env.SECRET";
    expect(() => parseProductionFeedbackEnvelope(input, { now: NOW })).toThrow(
      /unsupported field: sourceCode/u,
    );
  });

  it("creates a stable canonical payload hash independent of property order", () => {
    const parsed = parseProductionFeedbackEnvelope(validEnvelope(), { now: NOW });
    const reordered = { schemaVersion: parsed.schemaVersion, event: parsed.event };
    expect(productionFeedbackPayloadHash(parsed)).toMatch(/^[a-f0-9]{64}$/u);
    expect(productionFeedbackPayloadHash(reordered)).toBe(
      productionFeedbackPayloadHash(parsed),
    );
  });
});

describe("production feedback decisions", () => {
  it("distinguishes a new delivery, an idempotent replay, and a conflicting replay", () => {
    expect(decideFeedbackDelivery(undefined, "a".repeat(64))).toBe("accept");
    expect(decideFeedbackDelivery("a".repeat(64), "a".repeat(64))).toBe("replay");
    expect(decideFeedbackDelivery("b".repeat(64), "a".repeat(64))).toBe("conflict");
  });

  it("derives a review-required memory and regression proposal without executable code", () => {
    const parsed = parseProductionFeedbackEnvelope(validEnvelope(), { now: NOW });
    const candidate = deriveFeedbackCandidate(parsed.event);

    expect(candidate.status).toBe("pending");
    expect(candidate.rootCause).toBeNull();
    expect(candidate.regressionProposal).toEqual({
      objective: "Prove organization ownership is enforced after authentication.",
      requirementRefs: ["invoice-access#INV-001"],
      suggestedAdapter: "vitest",
      suggestedPath: "tests/invoices/cross-tenant.test.ts",
      status: "proposed",
    });
    expect(candidate).not.toHaveProperty("testSource");
  });
});
