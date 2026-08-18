"use client";

import { useState } from "react";

const sessions = [
  {
    command: "maru init",
    label: "Initialize",
    output: [
      "MaruCheck initialized in .maru/",
      "Detected: npm, Next.js, TypeScript, Vitest, Playwright",
      "Created: maru.yml, contracts/, requirements/, generated/",
      "Next: review the generated configuration before verification.",
    ],
  },
  {
    command: "maru risk --diff",
    label: "Assess risk",
    output: [
      "Risk: CRITICAL (92/100)",
      "Changed files: 3 (+41 -12)",
      "Related contracts: invoice-access",
      "Historical risks: MEM-0143",
      "+25 Critical authorization history matched",
      "Recommended: security, API, contract-regression",
    ],
  },
  {
    command: "maru verify --diff",
    label: "Verify",
    output: [
      "Verification gate: BLOCKED",
      "[CRITICAL] BLOCKING · invoice-access#INV-001",
      "Expected: Users can only read invoices owned by their account.",
      "Actual: Cross-account invoice payload returned.",
      "Reproduce: npx vitest run tests/regressions/cross-account.test.ts",
      "Report: .maru/artifacts/runs/RUN-1048/report.json",
    ],
  },
] as const;

export function MarketingTerminal() {
  const [active, setActive] = useState(2);
  const session = sessions[active];

  return (
    <div className="cli-terminal">
      <div className="cli-terminal__bar">
        <div aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>maru — local verification</span>
        <small>stdio / trusted</small>
      </div>
      <div className="cli-terminal__tabs" role="tablist" aria-label="MaruCheck CLI examples">
        {sessions.map((item, index) => (
          <button
            aria-selected={active === index}
            key={item.command}
            onClick={() => setActive(index)}
            role="tab"
            type="button"
          >
            <span>0{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="cli-terminal__screen" role="tabpanel">
        <p>
          <span>~/project</span> <b>main*</b>
        </p>
        <div className="cli-command">
          <span>$</span>
          <code>{session.command}</code>
        </div>
        <div className="cli-output" key={session.command} aria-live="polite">
          {session.output.map((line, index) => (
            <p className={line.includes("BLOCKED") || line.includes("CRITICAL") ? "is-alert" : ""} key={line}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {line}
            </p>
          ))}
        </div>
        <div className="cli-cursor" aria-hidden="true">
          <span>$</span>
          <i />
        </div>
      </div>
    </div>
  );
}
