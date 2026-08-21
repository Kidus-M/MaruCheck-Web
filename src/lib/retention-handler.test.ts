import { describe, expect, it, vi } from "vitest";
import { handleRetentionRequest } from "./retention-handler";

function request(secret = "cron-secret-value") {
  return new Request("https://beta.marucheck.dev/api/internal/maintenance/retention", {
    headers: { authorization: `Bearer ${secret}` },
  });
}

describe("retention maintenance boundary", () => {
  it("rejects missing and incorrect cron credentials", async () => {
    const prune = vi.fn();
    const missing = await handleRetentionRequest(
      new Request("https://beta.marucheck.dev/api/internal/maintenance/retention"),
      { cronSecret: "cron-secret-value", prune },
    );
    const incorrect = await handleRetentionRequest(request("wrong"), {
      cronSecret: "cron-secret-value",
      prune,
    });

    expect(missing.status).toBe(401);
    expect(incorrect.status).toBe(401);
    expect(prune).not.toHaveBeenCalled();
  });

  it("reports the bounded deletion counts", async () => {
    const response = await handleRetentionRequest(request(), {
      cronSecret: "cron-secret-value",
      prune: vi.fn().mockResolvedValue({ audits: 7, feedback: 2, rateWindows: 11 }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      deleted: { audits: 7, feedback: 2, rateWindows: 11 },
      status: "complete",
    });
  });

  it("fails closed when maintenance is not configured or persistence fails", async () => {
    const unconfigured = await handleRetentionRequest(request(), {
      cronSecret: undefined,
      prune: vi.fn(),
    });
    const failed = await handleRetentionRequest(request(), {
      cronSecret: "cron-secret-value",
      prune: vi.fn().mockRejectedValue(new Error("database details")),
    });

    expect(unconfigured.status).toBe(503);
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("database details");
  });
});
