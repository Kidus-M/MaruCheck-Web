import { describe, expect, it } from "vitest";
import { runDecisionContent } from "@/lib/run-decision";

describe("run decision content", () => {
  it("shows the submitted reasons for a blocked verification gap", () => {
    const content = runDecisionContent({
      gateReasons: [
        "1 raw blocking verification result did not pass.",
        "5 blocking findings remain open.",
      ],
      status: "blocked",
    });

    expect(content).toEqual({
      summary: "1 raw blocking verification result did not pass. 5 blocking findings remain open.",
      title: "Verification blocked this release",
    });
    expect(content.summary).not.toContain("critical approved requirement");
  });

  it("uses an accurate fallback when an older blocked run has no stored reasons", () => {
    expect(runDecisionContent({ gateReasons: [], status: "blocked" }).summary).toBe(
      "One or more required checks did not produce release-ready evidence.",
    );
  });

  it("keeps passed and running decisions distinct from blocked runs", () => {
    expect(runDecisionContent({ gateReasons: [], status: "passed" }).title).toBe(
      "Verification supports release",
    );
    expect(runDecisionContent({ gateReasons: [], status: "running" }).title).toBe(
      "Verification is still collecting evidence",
    );
  });
});
