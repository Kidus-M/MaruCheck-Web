import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Icon } from "@/components/icon";
import { MarketingTerminal } from "@/components/marketing-terminal";
import { MarketingCta } from "@/components/marketing-ui";
import { PressureSequence } from "@/components/pressure-sequence";
import { VerificationDemo } from "@/components/verification-demo";
import { fetchStarCount, formatStarCount } from "@/lib/github-stars";
import { MARUCHECK_CLI_SPEC, MARUCHECK_SOURCE_URL } from "@/lib/public-release";

const INSTALL_COMMAND = `npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}`;

export default async function HomePage() {
  const stars = await fetchStarCount();

  return (
    <>
      <section className="v2-hero" data-gsap-hero>
        <div className="v2-hero__grid" aria-hidden="true" />
        <div className="v2-hero__glow" aria-hidden="true" />
        <div className="marketing-container v2-hero__copy">
          <p className="v2-kicker">
            <a
              className="v2-kicker__badge"
              href={MARUCHECK_SOURCE_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Icon fill="currentColor" name="github" stroke="none" />
              Open source / MIT
              {stars === null ? null : <b>{formatStarCount(stars)}</b>}
            </a>
            Independent verification for AI-coded software
          </p>
          <h1>
            <span className="hero-word-clip">
              <span className="hero-word">Test what</span>
            </span>
            <span className="hero-word-clip hero-word-clip--offset">
              <span className="hero-word">
                your AI <em>didn’t.</em>
              </span>
            </span>
          </h1>
          <div className="v2-hero__deck">
            <div className="v2-hero__premise">
              <span>THE TRUST GAP</span>
              <p>AI can change the implementation and the tests that judge it.</p>
            </div>
            <div className="v2-hero__answer">
              <p>
                MaruCheck keeps an independent record of approved behavior, then challenges every
                change against it.
              </p>
              <div className="marketing-actions">
                <MarketingCta href="/docs/getting-started">Verify your first change</MarketingCta>
                <a
                  className="v2-source-button"
                  href={MARUCHECK_SOURCE_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon fill="currentColor" name="github" stroke="none" />
                  Read the CLI source
                </a>
              </div>
              <div className="v2-hero__install">
                <span aria-hidden="true">$</span>
                <code>npm i -D {MARUCHECK_CLI_SPEC}</code>
                <CopyButton label="Copy" value={INSTALL_COMMAND} />
              </div>
              <a className="v2-watch-link v2-watch-link--scroll" href="#workflow">
                See the decision unfold <span>↓</span>
              </a>
            </div>
          </div>
        </div>
        <div className="marketing-container v2-hero__demo">
          <div className="v2-demo-label">
            <span>AI SAID “DONE” / MARU STARTED CHECKING</span>
            <b>
              <i /> RELEASE BLOCKED
            </b>
          </div>
          <VerificationDemo />
        </div>
        <div className="v2-trust-rail">
          <div className="marketing-container">
            <span>Fits the tools already doing the work</span>
            <p>Codex</p>
            <p>Claude Code</p>
            <p>Cursor</p>
            <p>GitHub Actions</p>
            <p>Vitest</p>
            <p>Playwright</p>
          </div>
        </div>
      </section>

      <section className="blind-spot">
        <div className="marketing-container blind-spot__grid">
          <p className="section-index">01 — THE BLIND SPOT</p>
          <div data-gsap>
            <span>AI writes software fast.</span>
            <h2>
              A green suite can still prove the <em>wrong product.</em>
            </h2>
          </div>
          <aside data-gsap>
            <span>CODE</span>
            <i>→</i>
            <span>TESTS</span>
            <i>→</i>
            <b>GREEN</b>
            <small>Requirement never checked</small>
          </aside>
        </div>
      </section>

      <section className="pressure-story" id="workflow">
        <div className="marketing-container pressure-story__intro" data-gsap>
          <p className="section-index">02 — UNDER PRESSURE</p>
          <h2>
            One change enters.
            <br />
            Every assumption gets challenged.
          </h2>
          <p>
            Scroll through a real MaruCheck decision. The proof changes because the state changes.
          </p>
        </div>
        <div className="marketing-container">
          <PressureSequence />
        </div>
      </section>

      <section className="semantic-interrupt">
        <div className="semantic-interrupt__scan" aria-hidden="true" />
        <div className="marketing-container semantic-interrupt__heading" data-gsap>
          <p className="section-index">03 — SEMANTIC DRIFT</p>
          <h2>
            The tests adapted.
            <br />
            The promise did not.
          </h2>
        </div>
        <div className="marketing-container semantic-interrupt__console" data-gsap>
          <div className="semantic-diff">
            <header>
              <span>src/billing/limits.ts</span>
              <b>1 semantic change</b>
            </header>
            <code>
              <i>−</i> FREE_LIMIT = <strong>5</strong>
            </code>
            <code className="is-added">
              <i>+</i> FREE_LIMIT = <strong>10</strong>
            </code>
          </div>
          <div className="semantic-verdict">
            <span>SEMANTIC CHANGE DETECTED</span>
            <dl>
              <div>
                <dt>Expected</dt>
                <dd>Free users may create 5 projects.</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>Free users may create 10 projects.</dd>
              </div>
            </dl>
            <strong>
              <i /> OWNER APPROVAL REQUIRED
            </strong>
          </div>
        </div>
      </section>

      <section className="memory-recall">
        <div className="marketing-container memory-recall__grid">
          <div className="memory-recall__copy" data-gsap>
            <p className="section-index">04 — QA MEMORY</p>
            <h2>
              A bug should only surprise you <em>once.</em>
            </h2>
            <p>
              When related code changes again, MaruCheck recalls the failure and forces its
              regression back into the plan.
            </p>
            <Link className="text-action" href="/docs/qa-memory">
              How memory is matched <Icon name="arrow" />
            </Link>
          </div>
          <div className="memory-trace" data-gsap>
            <article>
              <time>03 APR</time>
              <span>MEM-0143</span>
              <h3>Invoice ownership bypass</h3>
              <p>Missing server-side account check.</p>
            </article>
            <div className="memory-trace__line">
              <i />
              <b>RELATED PATH CHANGED</b>
              <i />
            </div>
            <article className="is-now">
              <time>NOW</time>
              <span>REGRESSION RECALLED</span>
              <h3>cross-account.test.ts</h3>
              <p>Forced into this verification plan.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="agent-boundary">
        <div className="marketing-container agent-boundary__grid">
          <div data-gsap>
            <p className="section-index">05 — AGENT BOUNDARY</p>
            <h2>
              Let the agent call the verifier.
              <br />
              <em>Don’t let it approve itself.</em>
            </h2>
            <p>
              Codex, Claude Code, Cursor, and compatible MCP clients can run MaruCheck and read
              structured evidence. Approval remains human-owned.
            </p>
            <Link className="text-action text-action--light" href="/docs/mcp">
              Connect an MCP client <Icon name="arrow" />
            </Link>
          </div>
          <div className="agent-call" data-gsap>
            <header>
              <span>CODEX → MARU MCP</span>
              <b>
                <i /> CONNECTED
              </b>
            </header>
            <p>
              <small>CODING AGENT</small>I changed invoice authorization. Existing tests pass.
            </p>
            <div>
              <span>TOOL CALL</span>
              <code>maru_run_verification</code>
              <pre>{`{ "diff": "working-tree", "evidence": true }`}</pre>
            </div>
            <section>
              <span>RESULT / 1.42s</span>
              <strong>BLOCKED</strong>
              <p>Cross-account regression reproduced.</p>
              <code>invoice-access#INV-001 · critical</code>
            </section>
          </div>
        </div>
      </section>

      <section className="v2-cli">
        <div className="marketing-container v2-cli__heading" data-gsap>
          <p className="section-index">06 — LOCAL EXECUTION</p>
          <h2>
            The check runs where
            <br />
            the change lives.
          </h2>
          <p>
            Source and secrets stay in the repository or CI runner. MaruCheck produces reviewable
            evidence under <code>.maru/</code>.
          </p>
        </div>
        <div className="marketing-container v2-cli__terminal" data-gsap>
          <MarketingTerminal />
        </div>
      </section>

      <section className="source-boundary">
        <div className="marketing-container source-boundary__inner" data-gsap>
          <p className="section-index">07 — RELEASE PROOF</p>
          <h2>
            Not another confidence score.
            <br />
            <em>A decision with receipts.</em>
          </h2>
          <div className="source-boundary__flow">
            <div>
              <span>YOUR REPOSITORY</span>
              <strong>Code · tests · secrets</strong>
              <b>LOCAL</b>
            </div>
            <i aria-hidden="true" />
            <div>
              <span>MARUCHECK</span>
              <strong>Contracts · findings · evidence</strong>
              <b>INSPECTABLE</b>
            </div>
          </div>
          <div className="marketing-actions">
            <MarketingCta href="/docs/getting-started">Verify your first change</MarketingCta>
            <MarketingCta href="/dashboard" secondary>
              Inspect the proof console
            </MarketingCta>
          </div>
        </div>
      </section>
    </>
  );
}
