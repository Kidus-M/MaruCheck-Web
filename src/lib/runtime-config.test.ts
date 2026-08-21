import { describe, expect, it } from "vitest";
import { inspectBetaEnvironment, resolveBetaSignupPolicy } from "./runtime-config";

const VALID_ENV = {
  BETTER_AUTH_SECRET: "a".repeat(48),
  BETTER_AUTH_URL: "https://beta.marucheck.dev",
  CRON_SECRET: "b".repeat(48),
  DATABASE_URL:
    "postgresql://user:password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  MARUCHECK_BETA_EMAILS: "owner@example.com, Tester@Example.com",
};

describe("beta runtime configuration", () => {
  it("accepts a pooled Neon URL, secure auth origin, secrets, and beta allowlist", () => {
    const result = inspectBetaEnvironment(VALID_ENV, { production: true });

    expect(result.ready).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.signupMode).toBe("allowlist");
  });

  it("rejects unsafe production configuration without echoing secret values", () => {
    const result = inspectBetaEnvironment(
      {
        ...VALID_ENV,
        BETTER_AUTH_SECRET: "short",
        BETTER_AUTH_URL: "http://beta.marucheck.dev",
        CRON_SECRET: "replace-me",
        DATABASE_URL:
          "postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require",
        GITHUB_CLIENT_ID: "configured-without-secret",
      },
      { production: true },
    );

    expect(result.ready).toBe(false);
    expect(result.errors.join(" ")).not.toContain("short");
    expect(result.errors.join(" ")).not.toContain("replace-me");
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("pooled"),
        expect.stringContaining("HTTPS"),
        expect.stringContaining("BETTER_AUTH_SECRET"),
        expect.stringContaining("CRON_SECRET"),
        expect.stringContaining("GitHub OAuth"),
      ]),
    );
  });

  it("locks production signup when neither an allowlist nor explicit open mode exists", () => {
    const result = inspectBetaEnvironment(
      { ...VALID_ENV, MARUCHECK_BETA_EMAILS: undefined },
      { production: true },
    );

    expect(result.ready).toBe(true);
    expect(result.signupMode).toBe("locked");
    expect(result.warnings).toContain(
      "New account creation is locked until MARUCHECK_BETA_EMAILS is configured.",
    );
  });

  it("normalizes and deduplicates beta emails", () => {
    const policy = resolveBetaSignupPolicy(
      { MARUCHECK_BETA_EMAILS: "Owner@Example.com, owner@example.com, qa@example.com" },
      { production: true },
    );

    expect(policy).not.toBeNull();
    expect([...policy!]).toEqual(["owner@example.com", "qa@example.com"]);
  });

  it("keeps local signup open unless explicitly constrained", () => {
    expect(resolveBetaSignupPolicy({}, { production: false })).toBeNull();
  });
});
