import { describe, expect, it, vi } from "vitest";
import { handleLivenessRequest, handleReadinessRequest } from "./health-handler";

const READY_CONFIG = {
  errors: [],
  ready: true,
  signupMode: "allowlist" as const,
  warnings: [],
};

describe("health route boundaries", () => {
  it("returns a cache-disabled liveness response without touching the database", async () => {
    const response = handleLivenessRequest({ deployment: "test", revision: "abc123" });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      deployment: "test",
      revision: "abc123",
      service: "maru-web",
      status: "alive",
    });
  });

  it("returns ready only when configuration and database checks pass", async () => {
    const checkDatabase = vi.fn().mockResolvedValue(true);
    const response = await handleReadinessRequest({
      checkDatabase,
      configuration: READY_CONFIG,
      deployment: "preview",
      revision: "abc123",
    });

    expect(response.status).toBe(200);
    expect(checkDatabase).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toMatchObject({
      checks: { configuration: "pass", database: "pass" },
      signupMode: "allowlist",
      status: "ready",
    });
  });

  it("returns 503 and skips the database when required configuration is invalid", async () => {
    const checkDatabase = vi.fn();
    const response = await handleReadinessRequest({
      checkDatabase,
      configuration: { ...READY_CONFIG, errors: ["Missing secret."], ready: false },
      deployment: "production",
      revision: "unknown",
    });

    expect(response.status).toBe(503);
    expect(checkDatabase).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      checks: { configuration: "fail", database: "skipped" },
      status: "unavailable",
    });
  });

  it("returns 503 without exposing a database failure", async () => {
    const response = await handleReadinessRequest({
      checkDatabase: vi.fn().mockRejectedValue(new Error("contains-sensitive-host")),
      configuration: READY_CONFIG,
      deployment: "production",
      revision: "unknown",
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain("contains-sensitive-host");
    expect(JSON.parse(body)).toMatchObject({ checks: { database: "fail" } });
  });
});
