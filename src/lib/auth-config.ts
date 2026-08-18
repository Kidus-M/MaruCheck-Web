import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import * as schema from "@/db/schema";
import type { MaruDatabase } from "@/db";

interface MaruAuthOptions {
  readonly baseURL: string;
  readonly database: MaruDatabase;
  readonly github?: {
    readonly clientId: string;
    readonly clientSecret: string;
  };
  readonly secret: string;
}

export function createMaruAuth(options: MaruAuthOptions) {
  return betterAuth({
    appName: "MaruCheck",
    baseURL: options.baseURL,
    database: drizzleAdapter(options.database, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      autoSignIn: true,
      enabled: true,
      minPasswordLength: 12,
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
      }),
      nextCookies(),
    ],
    secret: options.secret,
    socialProviders: options.github === undefined ? {} : { github: options.github },
  });
}

export type MaruAuth = ReturnType<typeof createMaruAuth>;
