import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { Eyebrow, MarketingCta, MarketingPageHeader } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "Product",
  description: "Turn product intent into independent, inspectable release proof with MaruCheck.",
};

const layers = [
  { icon: "contracts", label: "Define", title: "Quality Contracts", body: "Capture the invariants, permissions, limits, and edge cases a feature must preserve. Contracts are versioned, reviewable, and designed to survive implementation changes." },
  { icon: "branch", label: "Select", title: "Change-risk analysis", body: "Map a diff to the requirements it can affect. Spend verification effort on the paths with the greatest potential release impact." },
  { icon: "runs", label: "Challenge", title: "Independent verification", body: "Run deterministic checks and generated adversarial scenarios outside the implementation agent's own reasoning loop." },
  { icon: "findings", label: "Decide", title: "Evidence-backed gates", body: "Block, warn, or pass with a traceable reason. Findings point to the exact contract, run, and retained evidence behind the decision." },
] as const;

export default function ProductPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="The product"
        title="A release system that remembers what the software promised."
        description="MaruCheck connects approved behavior to changed code, targeted challenges, and durable evidence—so fast delivery does not depend on blind trust."
      />
      <section className="marketing-section product-layers">
        <div className="marketing-container">
          {layers.map((layer, index) => (
            <article data-reveal key={layer.label}>
              <div className="product-layer__visual" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><Icon name={layer.icon} /><i /><i /></div>
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
          <div><Eyebrow>Designed for trust</Eyebrow><h2>The verifier should not grade its own homework.</h2></div>
          <div className="principle-list">
            <article><span>01</span><h3>Independent by design</h3><p>Verification is separated from the agent or developer that authored the change.</p></article>
            <article><span>02</span><h3>Explainable at every layer</h3><p>Every score and gate resolves to concrete requirements, findings, and evidence.</p></article>
            <article><span>03</span><h3>Local where code is sensitive</h3><p>Execution belongs in your repository and CI environment; collaboration can live in the cloud.</p></article>
          </div>
        </div>
      </section>
      <section className="inline-cta">
        <div className="marketing-container" data-reveal>
          <div><Eyebrow>See the whole proof trail</Eyebrow><h2>Explore a blocked release from decision to evidence.</h2></div>
          <MarketingCta href="/dashboard">Open the live dashboard</MarketingCta>
        </div>
      </section>
    </>
  );
}
