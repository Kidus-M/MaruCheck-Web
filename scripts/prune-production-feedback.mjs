import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Feedback retention check blocked: set DATABASE_URL_UNPOOLED or DATABASE_URL.");
  process.exit(1);
}

const execute = process.argv.includes("--execute");
const sql = neon(databaseUrl);

if (!execute) {
  const [feedback] = await sql`
    select count(*)::integer as count
    from production_feedback
    where retention_until <= now()
  `;
  const [rateWindows] = await sql`
    select count(*)::integer as count
    from feedback_ingestion_rate_window
    where window_started_at < now() - interval '24 hours'
  `;
  const [audits] = await sql`
    select count(*)::integer as count
    from production_feedback_audit
    where created_at < now() - interval '365 days'
  `;
  console.log(
    `Dry run: ${feedback?.count ?? 0} feedback aggregates, ${rateWindows?.count ?? 0} rate windows, and ${audits?.count ?? 0} audit entries are eligible. Pass --execute to prune them.`,
  );
  process.exit(0);
}

const expiredFeedback = await sql`
  delete from production_feedback
  where retention_until <= now()
  returning id
`;
const expiredRateWindows = await sql`
  delete from feedback_ingestion_rate_window
  where window_started_at < now() - interval '24 hours'
  returning id
`;
const expiredAudits = await sql`
  delete from production_feedback_audit
  where created_at < now() - interval '365 days'
  returning id
`;

console.log(
  `Pruned ${expiredFeedback.length} feedback aggregates, ${expiredRateWindows.length} rate windows, and ${expiredAudits.length} audit entries.`,
);
