import "server-only";

import { lte } from "drizzle-orm";
import { createTransactionalDatabase } from "@/db";
import {
  feedbackIngestionRateWindow,
  productionFeedback,
  productionFeedbackAudit,
} from "@/db/schema";
import type { RetentionResult } from "@/lib/retention-handler";

export async function pruneExpiredFeedback(
  databaseUrl: string,
  now = new Date(),
): Promise<RetentionResult> {
  const connection = createTransactionalDatabase(databaseUrl);
  try {
    return await connection.database.transaction(async (transaction) => {
      const feedback = await transaction
        .delete(productionFeedback)
        .where(lte(productionFeedback.retentionUntil, now))
        .returning({ id: productionFeedback.id });
      const rateWindows = await transaction
        .delete(feedbackIngestionRateWindow)
        .where(
          lte(
            feedbackIngestionRateWindow.windowStartedAt,
            new Date(now.getTime() - 24 * 60 * 60 * 1_000),
          ),
        )
        .returning({ id: feedbackIngestionRateWindow.id });
      const audits = await transaction
        .delete(productionFeedbackAudit)
        .where(
          lte(
            productionFeedbackAudit.createdAt,
            new Date(now.getTime() - 365 * 24 * 60 * 60 * 1_000),
          ),
        )
        .returning({ id: productionFeedbackAudit.id });
      return { audits: audits.length, feedback: feedback.length, rateWindows: rateWindows.length };
    });
  } finally {
    await connection.close();
  }
}
