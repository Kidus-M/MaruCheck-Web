import { timingSafeEqual } from "node:crypto";

export interface RetentionResult {
  readonly audits: number;
  readonly feedback: number;
  readonly rateWindows: number;
}

interface RetentionDependencies {
  readonly cronSecret: string | undefined;
  readonly prune: () => Promise<RetentionResult>;
}

export async function handleRetentionRequest(
  request: Request,
  dependencies: RetentionDependencies,
): Promise<Response> {
  if (!dependencies.cronSecret) return json({ status: "unavailable" }, 503);
  const authorization = request.headers.get("authorization") ?? "";
  if (!safeSecretEqual(authorization, `Bearer ${dependencies.cronSecret}`)) {
    return json({ status: "unauthorized" }, 401);
  }

  try {
    const deleted = await dependencies.prune();
    return json({ deleted, status: "complete" }, 200);
  } catch {
    return json({ status: "unavailable" }, 503);
  }
}

function safeSecretEqual(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function json(value: unknown, status: number): Response {
  return Response.json(value, { headers: { "cache-control": "no-store" }, status });
}
