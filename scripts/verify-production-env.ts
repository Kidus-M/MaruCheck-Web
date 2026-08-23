import { config } from "dotenv";
import { inspectProductionEnvironment } from "../src/lib/runtime-config.ts";

config({ path: ".env.local" });
config();

const inspection = inspectProductionEnvironment(process.env, { production: true });
for (const warning of inspection.warnings) {
  console.warn(`Production configuration warning: ${warning}`);
}
if (!inspection.ready) {
  for (const error of inspection.errors) {
    console.error(`Production configuration error: ${error}`);
  }
  process.exit(1);
}

const expectedOrigin = process.argv[2];
if (expectedOrigin !== undefined) {
  const configuredOrigin = normalizeOrigin(process.env.BETTER_AUTH_URL);
  const normalizedExpectedOrigin = normalizeOrigin(expectedOrigin);
  if (configuredOrigin === undefined || configuredOrigin !== normalizedExpectedOrigin) {
    console.error(`Production configuration error: BETTER_AUTH_URL must equal ${expectedOrigin}.`);
    process.exit(1);
  }
}

console.log(`Production environment is ready; signup mode is ${inspection.signupMode}.`);

function normalizeOrigin(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}
