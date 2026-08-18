import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { Eyebrow, MarketingCta, MarketingPageHeader } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "Product",
  description: "Turn product intent into independent, inspectable release proof with MaruCheck.",
};

const layers = [
  {
    icon: "contracts",
    label: "Protect intent",
    title: "Quality Contracts",
    body: "Capture the invariants, permissions, limits, and edge cases a feature must preserve. Contracts are versioned, reviewable, and designed to survive implementation changes.",
  },
  {
    icon: "branch",
    label: "Read the change",
    title: "Change-risk analysis",
    body: "Map a diff to the requirements it can affect. Spend verification effort on the paths with the greatest potential release impact.",
  },
  {
    icon: "runs",
    label: "Plan",
    title: "Requirement-linked plans",
    body: "Select affected requirements, existing regression tests, and risk-appropriate adapters. Missing coverage remains explicit instead of becoming an implied pass.",
  },
  {
    icon: "runs",
    label: "Execute",
    title: "Local test adapters",
    body: "Run the repository's installed Vitest and Playwright checks without downloading tools at verification time. Raw artifacts remain local and inspectable.",
  },
  {
    icon: "memory",
    label: "Remember",
    title: "Historical QA memory",
    body: "Match new diffs against confirmed incidents, add explainable risk, and force available recorded regression tests back into the plan.",
  },
  {
    icon: "findings",
    label: "Decide",
    title: "Evidence-backed gates",
    body: "Pass or block with a traceable reason. Every blocking finding includes the contract, requirement, expected behavior, actual result, reproduction, and evidence.",
  },
] as const;

export default function ProductPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Verification system"
        title="A verifier with a contract, a memory, and the authority to say no."
        description="MaruCheck connects approved behavior to the real Git diff, targeted local checks, historical regressions, and durable release evidence."
      />
      <section className="marketing-section product-layers">
        <div className="marketing-container">
          {layers.map((layer, index) => (
            <article data-reveal key={layer.label}>
              <div className="product-layer__visual" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <Icon name={layer.icon} />
                  <i />
                  <i />
                </div>
              </div>
              <div className="product-layer__copy">
                <Eyebrow>{layer.label}</Eyebrow>
                <h2>{layer.title}</h2>
                <p>{layer.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="product-principles">
        <div className="marketing-container" data-reveal>
          <div>
            <Eyebrow>Designed for trust</Eyebrow>
            <h2>The implementation agent does not grade its own work.</h2>
          </div>
          <div className="principle-list">
            <article>
              <span>01</span>
              <h3>Independent by design</h3>
              <p>Verification is separated from the agent or developer that authored the change.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Explainable at every layer</h3>
              <p>Every score and gate resolves to concrete requirements, findings, and evidence.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Conservative when proof is missing</h3>
              <p>
                Unavailable tools, missing tests, and uncovered requirements remain visible and can
                block. Inconclusive never becomes passed.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="inline-cta">
        <div className="marketing-container" data-reveal>
          <div>
            <Eyebrow>See the whole proof trail</Eyebrow>
            <h2>Explore a blocked release from decision to evidence.</h2>
          </div>
          <MarketingCta href="/dashboard">Open the live dashboard</MarketingCta>
        </div>
      </section>
    </>
  );
}
