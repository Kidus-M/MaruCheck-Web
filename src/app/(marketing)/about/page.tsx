import type { Metadata } from "next";
import { MarketingCta, MarketingPageHeader } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "About",
  description: "Why MaruCheck is built to test software under pressure.",
};

export default function AboutPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Why MaruCheck"
        title="Software does not fail on the path everyone rehearsed."
        description="MaruCheck is named for the idea of a difficult, failure-inducing test: a scenario designed to reveal how a system behaves when assumptions stop cooperating."
      />
      <section className="marketing-section about-story">
        <div className="marketing-container about-story__grid">
          <div className="about-orbit" aria-hidden="true">
            <i />
            <i />
            <span>PRESSURE / TEST</span>
          </div>
          <div data-reveal>
            <span className="signal-label">
              <span />
              The name
            </span>
            <h2>Built for the failure path.</h2>
            <p>
              The Kobayashi Maru idea is not about predicting one specific failure. It is about
              testing judgment and system behavior when the comfortable assumptions break. MaruCheck
              applies that pressure-test mindset to AI-generated software.
            </p>
            <p>
              The visual system borrows from diagnostic and command interfaces: calm information,
              explicit state, traceable sequences, and a clear red alert when evidence contradicts
              approved behavior. It does not borrow franchise imagery or branding.
            </p>
          </div>
        </div>
      </section>
      <section className="belief-section">
        <div className="marketing-container" data-reveal>
          <h2>Operating principles</h2>
          <div>
            <article>
              <span>01</span>
              <h3>Intent deserves a runtime.</h3>
              <p>Requirements should participate in delivery, not disappear after planning.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Evidence beats confidence theater.</h3>
              <p>
                A release gate is useful only when a person can inspect why it passed or failed.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>AI speed needs independent judgment.</h3>
              <p>The system that wrote the change should not be the only system evaluating it.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="inline-cta">
        <div className="marketing-container" data-reveal>
          <div>
            <h2>See the pressure test reach a release decision.</h2>
            <p>Follow one blocked finding from approved intent to reproducible evidence.</p>
          </div>
          <MarketingCta href="/dashboard">Open the proof console</MarketingCta>
        </div>
      </section>
    </>
  );
}
