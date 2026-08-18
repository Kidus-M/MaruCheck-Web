import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const migrationUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

export default defineConfig({
  dbCredentials: {
    url: migrationUrl ?? "postgresql://migration:required@localhost:5432/marucheck",
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema/*.ts",
  strict: true,
  verbose: true,
});
