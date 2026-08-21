import { currentLivenessResponse } from "@/lib/health-runtime";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return currentLivenessResponse();
}
