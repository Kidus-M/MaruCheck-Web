import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import * as schema from "@/db/schema";
import type { MaruDatabase } from "@/db";

interface MaruAuthOptions {
  readonly allowedSignupEmails: ReadonlySet<string> | null;
  readonly baseURL: string;
  readonly database: MaruDatabase;
  readonly github?: {
    readonly clientId: string;
    readonly clientSecret: string;
  };
  readonly google?: {
    readonly clientId: string;
    readonly clientSecret: string;
  };
  readonly secret: string;
}

export function createMaruAuth(options: MaruAuthOptions) {
  const signupsEnabled =
    options.allowedSignupEmails === null || options.allowedSignupEmails.size > 0;
  return betterAuth({
    appName: "MaruCheck",
    baseURL: options.baseURL,
    database: drizzleAdapter(options.database, {
      provider: "pg",
      schema,
    }),
    account: {
      encryptOAuthTokens: true,
    },
    emailAndPassword: {
      autoSignIn: true,
      disableSignUp: !signupsEnabled,
      enabled: true,
      minPasswordLength: 12,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) =>
            options.allowedSignupEmails === null ||
            options.allowedSignupEmails.has(user.email.trim().toLowerCase()),
        },
      },
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
      }),
      nextCookies(),
    ],
    secret: options.secret,
    rateLimit: {
      customRules: {
        "/sign-in/email": { max: 10, window: 60 },
        "/sign-up/email": { max: 5, window: 3_600 },
      },
      enabled: true,
      max: 100,
      storage: "database",
      window: 60,
    },
    socialProviders: {
      ...(options.github === undefined ? {} : { github: options.github }),
      ...(options.google === undefined ? {} : { google: options.google }),
    },
  });
}

export type MaruAuth = ReturnType<typeof createMaruAuth>;
