import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  closed: false,
  verificationValues: [] as Record<string, unknown>[],
}));

vi.mock("server-only", () => ({}));

vi.mock("@/db", () => ({
  createDatabase: () => ({
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            limit: async () => [
              {
                id: "token-id",
                organizationId: "organization-id",
                projectId: "connected-project-id",
                projectName: "Maru Web",
              },
            ],
          }),
        }),
      }),
    }),
  }),
  createTransactionalDatabase: () => ({
    close: async () => {
      state.closed = true;
    },
    database: {
      transaction: async (
        callback: (transaction: {
          insert: () => {
            values: (values: Record<string, unknown>) => {
              onConflictDoUpdate: () => {
                returning: () => Promise<{ id: string; runKey: string }[]>;
              };
            };
          };
          update: () => {
            set: () => { where: () => Promise<never[]> };
          };
        }) => Promise<unknown>,
      ) =>
        callback({
          insert: () => ({
            values: (values) => {
              state.verificationValues.push(values);
              return {
                onConflictDoUpdate: () => ({
                  returning: async () => [
                    { id: "verification-run-id", runKey: String(values.runKey) },
                  ],
                }),
              };
            },
          }),
          update: () => ({
            set: () => ({ where: async () => [] }),
          }),
        }),
    },
  }),
}));

import { POST } from "./route";

describe("POST /api/v1/ingest/runs", () => {
  beforeEach(() => {
    state.closed = false;
    state.verificationValues.length = 0;
    vi.stubEnv("DATABASE_URL", "postgresql://test.invalid/marucheck");
  });

  it("binds a differently named local report to the bearer token's project", async () => {
    const generatedAt = "2026-08-21T13:27:51.548Z";
    const response = await POST(
      new Request("https://maru-check.vercel.app/api/v1/ingest/runs", {
        body: JSON.stringify({
          branch: "main",
          commitSha: "0123456789abcdef",
          completedAt: generatedAt,
          report: {
            evidence: [],
            findings: [],
            gate: { reasons: [], status: "passed" },
            generatedAt,
            project: { name: "maru-web" },
            requirementEvidence: [],
            risk: { level: "low", score: 4 },
            runId: "2026-08-21T13-27-51-548Z",
            schemaVersion: 1,
          },
          schemaVersion: 1,
          startedAt: generatedAt,
          title: "Verify hosted upload",
        }),
        headers: {
          authorization: "Bearer maru_valid-project-token",
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      accepted: true,
      projectId: "connected-project-id",
      runId: "2026-08-21T13-27-51-548Z",
    });
    expect(state.verificationValues[0]).toMatchObject({
      organizationId: "organization-id",
      projectId: "connected-project-id",
    });
    expect(state.closed).toBe(true);
  });
});
