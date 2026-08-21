import { config } from "dotenv";

config({ path: ".env.local" });
config();

const directUrl = process.env.DATABASE_URL_UNPOOLED;
if (!directUrl) {
  console.error("Database migration blocked: set DATABASE_URL_UNPOOLED to a direct Neon endpoint.");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(directUrl);
} catch {
  console.error("Database migration blocked: DATABASE_URL_UNPOOLED is not a valid URL.");
  process.exit(1);
}

if (
  !["postgres:", "postgresql:"].includes(parsed.protocol) ||
  !parsed.hostname.endsWith(".neon.tech") ||
  parsed.hostname.includes("-pooler.") ||
  parsed.searchParams.get("sslmode") !== "require"
) {
  console.error(
    "Database migration blocked: DATABASE_URL_UNPOOLED must be a TLS-enabled direct Neon endpoint.",
  );
  process.exit(1);
}

if (
  (process.env.VERCEL_ENV === "production" ||
    process.env.MARUCHECK_DEPLOYMENT_ENV === "production") &&
  process.env.ALLOW_PRODUCTION_MIGRATION !== "true"
) {
  console.error(
    "Production migration blocked: inspect the schema diff and set ALLOW_PRODUCTION_MIGRATION=true for the approved migration job.",
  );
  process.exit(1);
}
