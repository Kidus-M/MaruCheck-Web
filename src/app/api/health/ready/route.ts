import { currentReadinessResponse } from "@/lib/health-runtime";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return currentReadinessResponse();
}
