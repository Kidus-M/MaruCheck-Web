import type { Metadata } from "next";
import { MarketingCta, MarketingPageHeader } from "@/components/marketing-ui";

export const metadata: Metadata = { title: "About", description: "Why MaruCheck exists and what the circle in its name means." };

export default function AboutPage() {
  return (
    <>
      <MarketingPageHeader eyebrow="Why MaruCheck" title="A check mark says a task ran. A circle says the answer is right." description="MaruCheck exists to make that stronger claim inspectable: not merely that software was tested, but that the behavior people approved is still true." />
      <section className="marketing-section about-story">
        <div className="marketing-container about-story__grid">
          <div className="about-orbit" aria-hidden="true"><i /><i /><span>正</span></div>
          <div data-reveal>
            <span className="marketing-eyebrow">The name</span>
            <h2>Maru is the circle of approval.</h2>
            <p>In Japanese marking, a maru (○) indicates that something is correct or good. A double circle strengthens that approval. Our identity turns that idea into a proof orbit: intent at the center, evidence around it, and visible gaps when the circle cannot close.</p>
            <p>That is the product standard too. MaruCheck should never hide uncertainty behind a green badge. If the evidence is incomplete, the circle remains open.</p>
          </div>
        </div>
      </section>
      <section className="belief-section">
        <div className="marketing-container" data-reveal>
          <h2>What we believe</h2>
          <div><article><span>01</span><h3>Intent deserves a runtime.</h3><p>Requirements should participate in delivery, not disappear after planning.</p></article><article><span>02</span><h3>Evidence beats confidence theater.</h3><p>A release gate is valuable only when a person can inspect why it passed.</p></article><article><span>03</span><h3>AI speed needs independent judgment.</h3><p>The faster implementation becomes, the more important a separate verification loop becomes.</p></article></div>
        </div>
      </section>
      <section className="inline-cta"><div className="marketing-container" data-reveal><div><h2>See the circle in motion.</h2><p>Walk through the release decision, findings, contracts, and evidence.</p></div><MarketingCta href="/dashboard">Explore the dashboard</MarketingCta></div></section>
    </>
  );
}
