import type { BetaEnvironmentInspection } from "./runtime-config";

interface DeploymentIdentity {
  readonly deployment: string;
  readonly revision: string;
}

interface ReadinessDependencies extends DeploymentIdentity {
  readonly checkDatabase: () => Promise<boolean>;
  readonly configuration: BetaEnvironmentInspection;
}

const NO_STORE_HEADERS = { "cache-control": "no-store" };

export function handleLivenessRequest(identity: DeploymentIdentity): Response {
  return Response.json(
    {
      ...identity,
      service: "maru-web",
      status: "alive",
      version: "0.1.0",
    },
    { headers: NO_STORE_HEADERS },
  );
}

export async function handleReadinessRequest(
  dependencies: ReadinessDependencies,
): Promise<Response> {
  if (!dependencies.configuration.ready) {
    return readinessResponse(dependencies, "skipped", 503);
  }

  let databaseReady = false;
  try {
    databaseReady = await dependencies.checkDatabase();
  } catch {
    databaseReady = false;
  }
  return readinessResponse(
    dependencies,
    databaseReady ? "pass" : "fail",
    databaseReady ? 200 : 503,
  );
}

function readinessResponse(
  dependencies: ReadinessDependencies,
  database: "fail" | "pass" | "skipped",
  status: 200 | 503,
): Response {
  return Response.json(
    {
      checks: {
        configuration: dependencies.configuration.ready ? "pass" : "fail",
        database,
      },
      deployment: dependencies.deployment,
      revision: dependencies.revision,
      service: "maru-web",
      signupMode: dependencies.configuration.signupMode,
      status: status === 200 ? "ready" : "unavailable",
      version: "0.1.0",
    },
    { headers: NO_STORE_HEADERS, status },
  );
}
