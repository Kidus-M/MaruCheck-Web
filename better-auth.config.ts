import "dotenv/config";
import { createDatabase } from "./src/db";
import { createMaruAuth } from "./src/lib/auth-config";

const schemaOnlyUrl = "postgresql://schema:generator@localhost:5432/marucheck";

export const auth = createMaruAuth({
  allowedSignupEmails: null,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: createDatabase(process.env.DATABASE_URL ?? schemaOnlyUrl),
  secret:
    process.env.BETTER_AUTH_SECRET ?? "schema-generation-only-secret-do-not-use-in-production",
});

export default auth;
