import type { VerificationRunSummary } from "@/lib/dashboard-types";

export interface RunDecisionContent {
  readonly summary: string;
  readonly title: string;
}

type RunDecisionInput = Pick<VerificationRunSummary, "gateReasons" | "status">;

/** Present the submitted gate decision without inventing a stronger failure than the report made. */
export function runDecisionContent(run: RunDecisionInput): RunDecisionContent {
  if (run.status === "passed") {
    return {
      summary: "Selected requirements have conclusive evidence for this change.",
      title: "Verification supports release",
    };
  }
  if (run.status === "running") {
    return {
      summary: "Selected checks are still collecting evidence for this change.",
      title: "Verification is still collecting evidence",
    };
  }
  return {
    summary: blockedSummary(run.gateReasons),
    title: "Verification blocked this release",
  };
}

function blockedSummary(reasons: readonly string[]): string {
  if (reasons.length === 0) {
    return "One or more required checks did not produce release-ready evidence.";
  }
  const visible = reasons.slice(0, 3).join(" ");
  const remaining = reasons.length - 3;
  return remaining > 0
    ? `${visible} ${remaining} additional gate reason${remaining === 1 ? "" : "s"} recorded.`
    : visible;
}
