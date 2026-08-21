import "server-only";
import { createDatabase } from "@/db";
import { createMaruAuth, type MaruAuth } from "@/lib/auth-config";
import {
  resolveBetaSignupPolicy,
  type BetaSignupMode,
} from "@/lib/runtime-config";

let authInstance: MaruAuth | undefined;

export function isAuthConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);
}

export function getAuth(): MaruAuth {
  if (authInstance !== undefined) return authInstance;

  const databaseUrl = process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!databaseUrl || !secret) {
    throw new Error(
      "MaruCheck authentication is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.",
    );
  }

  const github =
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }
      : undefined;

  authInstance = createMaruAuth({
    allowedSignupEmails: resolveBetaSignupPolicy(process.env, {
      production: process.env.NODE_ENV === "production",
    }),
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    database: createDatabase(databaseUrl),
    github,
    secret,
  });
  return authInstance;
}

export function isGithubAuthConfigured(): boolean {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export function getBetaSignupMode(): BetaSignupMode {
  const policy = resolveBetaSignupPolicy(process.env, {
    production: process.env.NODE_ENV === "production",
  });
  return policy === null ? "open" : policy.size > 0 ? "allowlist" : "locked";
}
