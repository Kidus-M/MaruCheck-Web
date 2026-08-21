import { config } from "dotenv";
import { inspectBetaEnvironment } from "../src/lib/runtime-config.ts";

config({ path: ".env.local" });
config();

const inspection = inspectBetaEnvironment(process.env, { production: true });
for (const warning of inspection.warnings) console.warn(`Beta configuration warning: ${warning}`);
if (!inspection.ready) {
  for (const error of inspection.errors) console.error(`Beta configuration error: ${error}`);
  process.exit(1);
}

console.log(`Beta environment is ready; signup mode is ${inspection.signupMode}.`);
