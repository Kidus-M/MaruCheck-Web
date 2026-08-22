import type { Metadata } from "next";
import { MarketingCta } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "About",
  description: "Why Kidus Mesfin Teferi created MaruCheck to independently test AI-coded software.",
};

export default function AboutPage() {
  return (
    <>
      <section className="about-v2-hero" data-gsap-hero>
        <div className="about-v2-hero__rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="marketing-container">
          <p className="v2-kicker">
            <span>ABOUT / ORIGIN</span> Built for the failure path
          </p>
          <h1>
            <span className="hero-word-clip">
              <span className="hero-word">Why call it</span>
            </span>
            <span className="hero-word-clip hero-word-clip--offset">
              <span className="hero-word">
                <em>MaruCheck?</em>
              </span>
            </span>
          </h1>
          <div className="about-v2-hero__intro">
            <p>
              Because the comfortable test is rarely the one that reveals whether a system can be
              trusted.
            </p>
            <span>
              Created by
              <br />
              <strong>Kidus Mesfin Teferi</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="name-story">
        <div className="marketing-container name-story__grid">
          <p className="section-index">01 — THE NAME</p>
          <div className="name-origin-map" data-gsap>
            <span>KOBAYASHI MARU / CONCEPT</span>
            <div>
              <b>DIFFICULT</b>
              <p>Push the system beyond the conditions it was optimized to pass.</p>
            </div>
            <div>
              <b>UNEXPECTED</b>
              <p>Challenge assumptions the implementation and its tests may share.</p>
            </div>
            <div>
              <b>FAILURE-REVEALING</b>
              <p>Learn how the system behaves when the happy path stops cooperating.</p>
            </div>
            <strong>MARUCHECK</strong>
          </div>
          <div className="name-story__copy" data-gsap>
            <h2>A check designed for the scenario nobody rehearsed.</h2>
            <p>
              MaruCheck is named for the Kobayashi Maru concept: testing a system under difficult
              and unexpected conditions rather than merely checking the happy path.
            </p>
            <p>
              MaruCheck turns that pressure-test mindset into a developer tool. No franchise imagery
              or imitation—just the discipline of testing the uncomfortable path.
            </p>
          </div>
        </div>
      </section>

      <section className="origin-story">
        <div className="marketing-container origin-story__heading" data-gsap>
          <p className="section-index">02 — THE REASON</p>
          <h2>
            AI made writing code faster.
            <br />
            It did not make claims easier to trust.
          </h2>
        </div>
        <div className="marketing-container origin-sequence">
          <article data-gsap>
            <span>01</span>
            <h3>The agent changes code.</h3>
            <p>
              Often quickly, across more of the system than one person can inspect line by line.
            </p>
          </article>
          <article data-gsap>
            <span>02</span>
            <h3>The same context can change the tests.</h3>
            <p>
              A green result may confirm the new implementation without protecting the old product
              promise.
            </p>
          </article>
          <article data-gsap>
            <span>03</span>
            <h3>Teams need a separate source of judgment.</h3>
            <p>
              Approved intent, previous bugs, deterministic risk, and inspectable evidence should
              survive the coding session.
            </p>
          </article>
          <article className="is-answer" data-gsap>
            <span>04</span>
            <h3>That is the reason for MaruCheck.</h3>
            <p>The agent builds. An independent system proves—or refuses to.</p>
          </article>
        </div>
      </section>

      <section className="maker-story">
        <div className="marketing-container maker-story__grid">
          <div data-gsap>
            <p className="section-index">03 — THE MAKER</p>
            <h2>Created by Kidus Mesfin Teferi.</h2>
          </div>
          <div data-gsap>
            <p>
              MaruCheck is being built as a developer-native verification system: local-first at
              execution, precise about product intent, and honest when proof is missing.
            </p>
            <p>
              Its first users are developers working with coding agents—people who want the speed of
              AI without handing the same agent complete authority over what “correct” means.
            </p>
          </div>
        </div>
      </section>

      <section className="beliefs-v2">
        <div className="marketing-container" data-gsap>
          <p className="section-index">04 — WHAT STAYS TRUE</p>
          <div>
            <article>
              <span>01</span>
              <h3>Intent deserves a runtime.</h3>
              <p>Requirements should participate in delivery, not disappear after planning.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Evidence beats confidence theater.</h3>
              <p>A gate is useful only when a person can inspect why it passed or failed.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Memory compounds quality.</h3>
              <p>
                Once a bug teaches the system something, related changes should never start from
                zero.
              </p>
            </article>
          </div>
          <h2>
            The coding agent builds.
            <br />
            <em>MaruCheck proves.</em>
          </h2>
          <MarketingCta href="/docs/getting-started">Verify your first change</MarketingCta>
        </div>
      </section>
    </>
  );
}
