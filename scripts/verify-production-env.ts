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

console.log(`Production environment is ready; signup mode is ${inspection.signupMode}.`);
