import { describe, expect, it } from "vitest";
import { inspectProductionEnvironment, resolveSignupPolicy } from "./runtime-config";

const VALID_ENV = {
  BETTER_AUTH_SECRET: "a".repeat(48),
  BETTER_AUTH_URL: "https://marucheck.dev",
  CRON_SECRET: "b".repeat(48),
  DATABASE_URL:
    "postgresql://user:password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  MARUCHECK_ALLOWED_SIGNUP_EMAILS: "owner@example.com, Tester@Example.com",
};

describe("production runtime configuration", () => {
  it("accepts a pooled Neon URL, secure auth origin, secrets, and signup allowlist", () => {
    const result = inspectProductionEnvironment(VALID_ENV, { production: true });

    expect(result.ready).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.signupMode).toBe("allowlist");
  });

  it("rejects unsafe production configuration without echoing secret values", () => {
    const result = inspectProductionEnvironment(
      {
        ...VALID_ENV,
        BETTER_AUTH_SECRET: "short",
        BETTER_AUTH_URL: "http://marucheck.dev",
        CRON_SECRET: "replace-me",
        DATABASE_URL:
          "postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require",
        GITHUB_CLIENT_ID: "configured-without-secret",
        GOOGLE_CLIENT_SECRET: "configured-without-client-id",
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
        expect.stringContaining("Google OAuth"),
      ]),
    );
  });

  it("locks production signup when neither an allowlist nor explicit open mode exists", () => {
    const result = inspectProductionEnvironment(
      { ...VALID_ENV, MARUCHECK_ALLOWED_SIGNUP_EMAILS: undefined },
      { production: true },
    );

    expect(result.ready).toBe(true);
    expect(result.signupMode).toBe("locked");
    expect(result.warnings).toContain(
      "New account creation is locked until MARUCHECK_ALLOWED_SIGNUP_EMAILS is configured.",
    );
  });

  it("normalizes and deduplicates allowed signup emails", () => {
    const policy = resolveSignupPolicy(
      { MARUCHECK_ALLOWED_SIGNUP_EMAILS: "Owner@Example.com, owner@example.com, qa@example.com" },
      { production: true },
    );

    expect(policy).not.toBeNull();
    expect([...policy!]).toEqual(["owner@example.com", "qa@example.com"]);
  });

  it("keeps local signup open unless explicitly constrained", () => {
    expect(resolveSignupPolicy({}, { production: false })).toBeNull();
  });
});
