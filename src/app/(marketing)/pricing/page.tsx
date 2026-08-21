import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { MarketingPageHeader } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "Pricing",
  description: "The current availability of MaruCheck local and hosted workflows.",
};

const stages = [
  {
    access: "Available through npm",
    action: "Open the quickstart",
    href: "/docs/getting-started",
    name: "Local verification",
    scope:
      "Quality Contracts, deterministic diff risk, plans, Vitest and Playwright execution, evidence, semantic drift, QA memory, MCP, and GitHub Actions.",
    status: "FREE EARLY ACCESS",
  },
  {
    access: "Invited developers",
    action: "Inspect the dashboard",
    href: "/dashboard",
    name: "Shared proof",
    scope:
      "Organizations, protected dashboard access, shared contracts, run history, findings, requirement coverage, and team QA memory.",
    status: "INVITED ACCESS",
  },
  {
    access: "Selected design partners",
    action: "Review the architecture",
    href: "/docs",
    name: "Controlled deployment",
    scope:
      "Organization policy, custom retention, deployment boundaries, workflow integration, and future enterprise identity controls.",
    status: "DESIGN PARTNER",
  },
] as const;

export default function PricingPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Availability, not theater"
        title="Use the local system now. Add shared proof when the team is ready."
        description="Hosted billing is not active. This page states exactly what exists and who can access it instead of publishing fictional prices."
      />
      <section className="marketing-section pricing-ledger-section">
        <div className="marketing-container pricing-ledger">
          <header data-reveal>
            <span>OPERATING MODE</span>
            <span>CURRENT ACCESS</span>
            <span>SYSTEM SCOPE</span>
            <span>NEXT STEP</span>
          </header>
          {stages.map((stage, index) => (
            <article data-reveal key={stage.name}>
              <div className="pricing-ledger__name">
                <span>0{index + 1}</span>
                <div>
                  <h2>{stage.name}</h2>
                  <b>{stage.status}</b>
                </div>
              </div>
              <strong>{stage.access}</strong>
              <p>{stage.scope}</p>
              <Link href={stage.href}>
                {stage.action} <Icon name="arrow" />
              </Link>
            </article>
          ))}
        </div>
        <p className="pricing-note marketing-container">
          No payment flow is connected in this build. Hosted prices will be published before any
          billing is enabled.
        </p>
      </section>
    </>
  );
}
