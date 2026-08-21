import "server-only";

import { neon } from "@neondatabase/serverless";
import { handleLivenessRequest, handleReadinessRequest } from "@/lib/health-handler";
import { inspectBetaEnvironment } from "@/lib/runtime-config";

export function currentLivenessResponse(): Response {
  return handleLivenessRequest(deploymentIdentity());
}

export function currentReadinessResponse(): Promise<Response> {
  const databaseUrl = process.env.DATABASE_URL;
  return handleReadinessRequest({
    checkDatabase: async () => {
      if (!databaseUrl) return false;
      const sql = neon(databaseUrl);
      await sql`select 1 as ready`;
      return true;
    },
    configuration: inspectBetaEnvironment(process.env, {
      production: process.env.NODE_ENV === "production",
    }),
    ...deploymentIdentity(),
  });
}

function deploymentIdentity() {
  return {
    deployment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    revision: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
  };
}
