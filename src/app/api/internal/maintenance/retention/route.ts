import { handleRetentionRequest } from "@/lib/retention-handler";
import { pruneExpiredFeedback } from "@/lib/retention-store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export function GET(request: Request): Promise<Response> {
  return handleRetentionRequest(request, {
    cronSecret: process.env.CRON_SECRET,
    prune: async () => {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) throw new Error("Production feedback persistence is not configured.");
      return pruneExpiredFeedback(databaseUrl);
    },
  });
}
