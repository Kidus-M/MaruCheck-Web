import Link from "next/link";
import { Icon } from "@/components/icon";
import { Eyebrow, MarketingCta, ProofDiagram } from "@/components/marketing-ui";

const workflow = [
  {
    number: "01",
    title: "Make intent executable",
    body: "Turn the behavior people approved into versioned Quality Contracts—not another paragraph that drifts away from the code.",
  },
  {
    number: "02",
    title: "Focus on changed risk",
    body: "MaruCheck reads the diff, maps affected requirements, and spends verification effort where a regression would matter most.",
  },
  {
    number: "03",
    title: "Challenge the implementation",
    body: "Deterministic checks and adversarial scenarios probe the boundaries your happy-path suite is likely to miss.",
  },
  {
    number: "04",
    title: "Release with a proof trail",
    body: "Every decision links back to the requirement, run, finding, and evidence that supports it.",
  },
] as const;

const capabilities = [
  [
    "contracts",
    "Quality Contracts",
    "Approve behavior once. Verify it against every meaningful change.",
  ],
  ["coverage", "Risk-directed coverage", "See protected intent, not just executed lines."],
  ["findings", "Adversarial findings", "Prioritize proof gaps by their actual release impact."],
  ["runs", "CI release gate", "Make a clear, inspectable decision on every pull request."],
  ["memory", "QA memory", "Preserve patterns from incidents and previous regressions."],
  ["branch", "Drift detection", "Know when implementation and approved behavior stop agreeing."],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="marketing-hero">
        <div className="marketing-container marketing-hero__grid">
          <div className="marketing-hero__copy" data-reveal>
            <Eyebrow>Independent release proof for AI-built software</Eyebrow>
            <h1>
              Your AI can ship code. <span>Can it prove what stayed true?</span>
            </h1>
            <p>
              MaruCheck turns approved behavior into an executable release gate—then challenges
              risky changes and preserves the evidence behind every decision.
            </p>
            <div className="marketing-actions">
              <MarketingCta href="/dashboard">Explore the proof dashboard</MarketingCta>
              <MarketingCta href="#how-it-works" secondary>
                See how it works
              </MarketingCta>
            </div>
            <div className="hero-assurance" aria-label="Product principles">
              <span>
                <Icon name="check" /> Local-first execution
              </span>
              <span>
                <Icon name="check" /> CI-ready evidence
              </span>
              <span>
                <Icon name="check" /> Agent-compatible
              </span>
            </div>
          </div>
          <div className="marketing-hero__visual" data-reveal>
            <ProofDiagram />
            <article className="floating-proof floating-proof--contract">
              <span>QUALITY CONTRACT</span>
              <strong>Invoice access</strong>
              <small>7 requirements protected</small>
            </article>
            <article className="floating-proof floating-proof--finding">
              <span>CRITICAL FINDING</span>
              <strong>Ownership bypass</strong>
              <small>Release gate blocked</small>
            </article>
            <article className="floating-proof floating-proof--run">
              <span>RUN 1048</span>
              <strong>26 / 33</strong>
              <small>requirements proven</small>
            </article>
          </div>
        </div>
        <div className="hero-ticker" aria-hidden="true">
          <div>
            <span>INTENT</span>
            <i /> <span>RISK</span>
            <i /> <span>CHALLENGE</span>
            <i />
            <span>EVIDENCE</span>
            <i /> <span>RELEASE</span>
            <i /> <span>INTENT</span>
            <i />
            <span>RISK</span>
            <i /> <span>CHALLENGE</span>
            <i /> <span>EVIDENCE</span>
            <i />
            <span>RELEASE</span>
          </div>
        </div>
      </section>

      <section className="tool-strip" aria-label="Works with your delivery stack">
        <div className="marketing-container" data-reveal>
          <p>Built around the tools you already use</p>
          <div>
            <span>Next.js</span>
            <span>Vitest</span>
            <span>Playwright</span>
            <span>GitHub Actions</span>
            <span>Codex</span>
            <span>Claude</span>
            <span>Cursor</span>
          </div>
        </div>
      </section>

      <section className="marketing-section problem-section">
        <div className="marketing-container split-heading" data-reveal>
          <Eyebrow>The confidence gap</Eyebrow>
          <h2>A passing test suite is not the same as preserved intent.</h2>
          <p>
            AI compresses implementation time. It also increases the number of assumptions that can
            cross a pull request unnoticed. MaruCheck keeps the original promise in the loop.
          </p>
        </div>
        <div className="marketing-container contrast-grid" data-reveal>
          <article className="contrast-card contrast-card--before">
            <span>Without release proof</span>
            <h3>“The suite is green.”</h3>
            <ul>
              <li>Requirements live in scattered prose</li>
              <li>Coverage rewards execution, not intent</li>
              <li>Review depth depends on human bandwidth</li>
            </ul>
          </article>
          <div className="contrast-arrow" aria-hidden="true">
            <Icon name="arrow" />
          </div>
          <article className="contrast-card contrast-card--after">
            <span>With MaruCheck</span>
            <h3>“This behavior is proven.”</h3>
            <ul>
              <li>Approved intent is versioned beside the project</li>
              <li>Changed risk selects the right challenges</li>
              <li>Every release decision retains its evidence</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="marketing-section workflow-section" id="how-it-works">
        <div className="marketing-container split-heading" data-reveal>
          <Eyebrow>The proof loop</Eyebrow>
          <h2>One continuous line from human intent to release evidence.</h2>
          <p>
            Each step sharpens the next. The circle closes only when the evidence supports the
            promise.
          </p>
        </div>
        <div className="marketing-container workflow-grid">
          {workflow.map((item) => (
            <article data-reveal key={item.number}>
              <span>{item.number}</span>
              <div className="workflow-node" aria-hidden="true">
                <i />
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section product-window-section">
        <div className="marketing-container product-window-copy" data-reveal>
          <div>
            <Eyebrow>Clarity at release time</Eyebrow>
            <h2>One screen for the decision. Every detail one click away.</h2>
          </div>
          <MarketingCta href="/dashboard" secondary>
            Open the live product
          </MarketingCta>
        </div>
        <div className="marketing-container" data-reveal>
          <div className="product-window">
            <aside>
              <strong>
                <i /> MaruCheck
              </strong>
              <span className="active">Overview</span>
              <span>Projects</span>
              <span>Contracts</span>
              <span>Runs</span>
              <span>Findings</span>
              <span>Coverage</span>
            </aside>
            <div className="product-window__main">
              <header>
                <span>Release overview</span>
                <i />
                <i />
              </header>
              <div className="product-window__decision">
                <div className="mini-orbit">
                  <i />
                </div>
                <div>
                  <small>RELEASE DECISION</small>
                  <strong>One proof gap needs attention.</strong>
                  <p>Invoice ownership failed against an approved critical requirement.</p>
                </div>
                <b>BLOCKED</b>
              </div>
              <div className="product-window__metrics">
                <span>
                  86%<small>coverage</small>
                </span>
                <span>
                  3<small>findings</small>
                </span>
                <span>
                  28<small>evidence objects</small>
                </span>
              </div>
              <div className="product-window__rows">
                <p>
                  <i />
                  Invoice ownership bypass <b>CRITICAL</b>
                </p>
                <p>
                  <i />
                  Checkout retry ceiling <b>HIGH</b>
                </p>
                <p>
                  <i />
                  Session expiry copy <b>MEDIUM</b>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section capability-section">
        <div className="marketing-container split-heading" data-reveal>
          <Eyebrow>A complete proof system</Eyebrow>
          <h2>Everything needed to answer one difficult question.</h2>
          <p>Should this change ship—and what concrete evidence supports that answer?</p>
        </div>
        <div className="marketing-container capability-grid">
          {capabilities.map(([icon, title, body]) => (
            <article data-reveal key={title}>
              <span className="capability-icon">
                <Icon name={icon} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              <Link href="/product">
                Learn more <Icon name="arrow" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="local-first-section">
        <div className="marketing-container local-first-grid" data-reveal>
          <div className="local-seal" aria-hidden="true">
            <i />
            <span>LOCAL</span>
          </div>
          <div>
            <Eyebrow>Your code stays where it belongs</Eyebrow>
            <h2>Local execution. Shareable proof.</h2>
            <p>
              The CLI runs in the repository or CI environment. The hosted product receives the
              release facts and evidence references your team chooses to share—not a copy of your
              source tree.
            </p>
            <Link href="/docs/getting-started">
              Read the architecture notes <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="final-cta-section">
        <div className="marketing-container final-cta" data-reveal>
          <div className="final-cta__rings" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <Eyebrow>Close the confidence gap</Eyebrow>
          <h2>
            Let the agents move fast.
            <br />
            Make the release prove itself.
          </h2>
          <p>Explore the working dashboard now, then connect the CLI when you are ready.</p>
          <div className="marketing-actions">
            <MarketingCta href="/dashboard">Explore MaruCheck</MarketingCta>
            <MarketingCta href="/docs" secondary>
              Read the docs
            </MarketingCta>
          </div>
        </div>
      </section>
    </>
  );
}
