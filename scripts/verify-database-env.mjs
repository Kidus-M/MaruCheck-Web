import "dotenv/config";

if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  console.error(
    "Database migration blocked: set DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL first.",
  );
  process.exit(1);
}
