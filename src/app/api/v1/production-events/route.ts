import {
  handleProductionFeedbackRequest,
  FeedbackServiceError,
} from "@/lib/production-feedback-handler";
import {
  authenticateProjectTokenForFeedback,
  ingestProductionFeedback,
} from "@/lib/production-feedback-store";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const databaseUrl = process.env.DATABASE_URL;
  return handleProductionFeedbackRequest(request, {
    authenticate: async (rawToken, now) => {
      if (!databaseUrl) {
        throw new FeedbackServiceError(
          "UNAVAILABLE",
          "Hosted production-feedback persistence is not configured.",
        );
      }
      return authenticateProjectTokenForFeedback(databaseUrl, rawToken, now);
    },
    ingest: async (credential, envelope, payloadHash, now) => {
      if (!databaseUrl) {
        throw new FeedbackServiceError(
          "UNAVAILABLE",
          "Hosted production-feedback persistence is not configured.",
        );
      }
      return ingestProductionFeedback(databaseUrl, credential, envelope, payloadHash, now);
    },
    logError: (error, requestId) => {
      console.error("Production feedback ingestion failed", { error, requestId });
    },
  });
}
