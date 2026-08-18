import Link from "next/link";
import { Icon } from "@/components/icon";
import { MarketingTerminal } from "@/components/marketing-terminal";
import { Eyebrow, MarketingCta } from "@/components/marketing-ui";
import { VerificationDemo } from "@/components/verification-demo";

const workflow = [
  ["01", "Intent", "Approved behavior becomes a versioned Quality Contract."],
  ["02", "Change", "MaruCheck reads the real Git diff, not a summary of it."],
  ["03", "Risk", "Contracts, code paths, and previous failures determine the score."],
  ["04", "Plan", "Only the requirements and checks affected by the change are selected."],
  ["05", "Challenge", "Vitest, Playwright, and explicit review steps run locally or in CI."],
  ["06", "Evidence", "The gate links every result back to the promise it supports."],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="command-hero">
        <div className="command-hero__backdrop" aria-hidden="true">
          <span>MC-01</span>
          <span>PRESSURE / VERIFY / RELEASE</span>
        </div>
        <div className="marketing-container command-hero__intro">
          <div className="command-hero__copy" data-reveal>
            <Eyebrow>Independent QA for AI-generated software</Eyebrow>
            <h1>
              Test what your AI <em>didn’t.</em>
            </h1>
            <p>
              Your coding agent can make the change and make the tests pass. MaruCheck independently
              checks whether the product still does what people approved.
            </p>
            <div className="marketing-actions">
              <MarketingCta href="/docs/getting-started">Run MaruCheck locally</MarketingCta>
              <MarketingCta href="/dashboard" secondary>
                Inspect a blocked release
              </MarketingCta>
            </div>
          </div>
          <aside className="hero-manifest" data-reveal>
            <span>OPERATING PRINCIPLES</span>
            <dl>
              <div>
                <dt>Execution</dt>
                <dd>Local / CI</dd>
              </div>
              <div>
                <dt>Scoring</dt>
                <dd>Deterministic</dd>
              </div>
              <div>
                <dt>Approval</dt>
                <dd>Human-owned</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>Evidence</dd>
              </div>
            </dl>
          </aside>
        </div>
        <div className="marketing-container command-hero__demo" data-reveal>
          <VerificationDemo />
        </div>
        <div className="hero-system-line">
          <div className="marketing-container">
            <span>WORKS WITH</span>
            <p>Codex</p>
            <p>Claude Code</p>
            <p>Cursor</p>
            <p>GitHub Actions</p>
            <p>Vitest</p>
            <p>Playwright</p>
          </div>
        </div>
      </section>

      <section className="confidence-break">
        <div className="marketing-container confidence-break__grid">
          <span className="section-coordinate">01 / THE GAP</span>
          <div data-reveal>
            <p>AI writes software fast.</p>
            <h2>
              But the same model can misunderstand the code, the requirement, <em>and</em> the test.
            </h2>
          </div>
          <aside data-reveal>
            <span>Green suite</span>
            <strong>≠</strong>
            <span>Correct product</span>
          </aside>
        </div>
      </section>

      <section className="workflow-narrative" id="workflow">
        <div className="marketing-container workflow-narrative__heading" data-reveal>
          <div>
            <span className="section-coordinate">02 / VERIFICATION LOOP</span>
            <Eyebrow>From promise to release decision</Eyebrow>
          </div>
          <h2>One line of accountability through the entire change.</h2>
        </div>
        <div className="marketing-container workflow-sequence">
          <div className="workflow-sequence__rail" aria-hidden="true">
            <i />
          </div>
          {workflow.map(([number, title, body]) => (
            <article data-reveal key={number}>
              <span>{number}</span>
              <div className="workflow-sequence__node" aria-hidden="true">
                <i />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contract-lab">
        <div className="marketing-container contract-lab__grid">
          <div className="sticky-story" data-reveal>
            <span className="section-coordinate">03 / QUALITY CONTRACTS</span>
            <Eyebrow>Give intent a runtime</Eyebrow>
            <h2>The requirement survives the implementation.</h2>
            <p>
              A Quality Contract records the behavior that must stay true across refactors, agent
              changes, and test rewrites. Drafts remain drafts until an accountable owner approves
              them.
            </p>
            <Link className="text-action" href="/docs/quality-contracts">
              Read the contract model <Icon name="arrow" />
            </Link>
          </div>
          <div className="contract-inspector" data-reveal>
            <header>
              <div>
                <span className="window-dot" />
                <strong>subscription-management.yml</strong>
              </div>
              <span>APPROVED · v4</span>
            </header>
            <div className="contract-inspector__body">
              <div className="contract-code">
                <span className="code-row">
                  <i>01</i>
                  <code>
                    <b>id:</b> subscription-management
                  </code>
                </span>
                <span className="code-row">
                  <i>02</i>
                  <code>
                    <b>criticality:</b> high
                  </code>
                </span>
                <span className="code-row">
                  <i>03</i>
                  <code>
                    <b>owners:</b> [product, engineering]
                  </code>
                </span>
                <span className="code-row code-row--focus">
                  <i>04</i>
                  <code>
                    <b>requirements:</b>
                  </code>
                </span>
                <span className="code-row code-row--focus">
                  <i>05</i>
                  <code> - id: SUB-004</code>
                </span>
                <span className="code-row code-row--focus">
                  <i>06</i>
                  <code> statement: Cancellation keeps</code>
                </span>
                <span className="code-row code-row--focus">
                  <i>07</i>
                  <code> Pro active until period_end.</code>
                </span>
                <span className="code-row">
                  <i>08</i>
                  <code>
                    <b>evidence_policy:</b>
                  </code>
                </span>
                <span className="code-row">
                  <i>09</i>
                  <code> blocking: [SUB-004]</code>
                </span>
              </div>
              <aside className="contract-evidence">
                <p>REQUIREMENT TRACE</p>
                <strong>SUB-004</strong>
                <span>Protected behavior</span>
                <ol>
                  <li className="is-pass">
                    <i /> Contract approved
                  </li>
                  <li className="is-pass">
                    <i /> Vitest selected
                  </li>
                  <li className="is-pass">
                    <i /> Playwright selected
                  </li>
                  <li className="is-alert">
                    <i /> Observed: access ended immediately
                  </li>
                </ol>
                <b>REQUIREMENT FAILED</b>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="risk-system">
        <div className="marketing-container risk-system__heading" data-reveal>
          <span className="section-coordinate">04 / RISK ANALYSIS</span>
          <div>
            <Eyebrow>Changed code has context</Eyebrow>
            <h2>Three files in. One explainable score out.</h2>
          </div>
          <p>
            MaruCheck combines path classification, affected contracts, criticality, and historical
            failures. No model guesses the score.
          </p>
        </div>
        <div className="marketing-container risk-map" data-reveal>
          <section className="risk-map__column risk-map__files">
            <header>
              CHANGED FILES <span>+41 −12</span>
            </header>
            <div>
              <i />
              src/api/invoices/[id]/route.ts <span>AUTH</span>
            </div>
            <div>
              <i />
              src/services/invoices.ts <span>DATA</span>
            </div>
            <div>
              <i />
              tests/invoices.test.ts <span>TEST</span>
            </div>
          </section>
          <div className="risk-map__connector" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <section className="risk-map__column risk-map__signals">
            <header>IMPACT SIGNALS</header>
            <div>
              <span>Quality Contract</span>
              <b>invoice-access#INV-001</b>
            </div>
            <div>
              <span>Criticality</span>
              <b>Critical authorization boundary</b>
            </div>
            <div>
              <span>QA Memory</span>
              <b>MEM-0143 · prior IDOR</b>
            </div>
          </section>
          <div className="risk-map__connector risk-map__connector--single" aria-hidden="true">
            <i />
          </div>
          <section className="risk-score">
            <p>CHANGE RISK</p>
            <strong>
              92<span>/100</span>
            </strong>
            <div>
              <i />
            </div>
            <b>CRITICAL</b>
            <small>Security + API + historical regression selected</small>
          </section>
        </div>
      </section>

      <section className="memory-field">
        <div className="marketing-container memory-field__grid">
          <div data-reveal>
            <span className="section-coordinate">05 / QA MEMORY</span>
            <Eyebrow>The system remembers the expensive lesson</Eyebrow>
            <h2>The bug was fixed months ago. Its risk was not forgotten.</h2>
          </div>
          <div className="memory-timeline" data-reveal>
            <article>
              <time>03 APR</time>
              <i />
              <div>
                <span>INCIDENT RECORDED</span>
                <strong>MEM-0143 · Invoice ownership bypass</strong>
                <p>Root cause: missing server-side ownership check.</p>
              </div>
            </article>
            <article>
              <time>18 AUG</time>
              <i />
              <div>
                <span>RELATED DIFF DETECTED</span>
                <strong>authorization.ts changed</strong>
                <p>Exact file match and authorization terms recall the incident.</p>
              </div>
            </article>
            <article className="is-active">
              <time>NOW</time>
              <i />
              <div>
                <span>REGRESSION FORCED INTO PLAN</span>
                <strong>cross-account.test.ts</strong>
                <p>The recorded test runs even when ordinary name matching would miss it.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="drift-alert">
        <div className="marketing-container drift-alert__header" data-reveal>
          <div>
            <span className="section-coordinate">06 / SEMANTIC DRIFT</span>
            <Eyebrow>Tests may adapt. Meaning may not.</Eyebrow>
          </div>
          <p>
            MaruCheck never rewrites approved intent just to make a changed implementation green.
          </p>
        </div>
        <div className="marketing-container drift-console" data-reveal>
          <div className="drift-console__diff">
            <header>
              <span>src/uploads/limits.ts</span>
              <b>1 semantic change</b>
            </header>
            <code>
              <span>−</span> FREE_LIMIT = 5
            </code>
            <code className="is-added">
              <span>+</span> FREE_LIMIT = 10
            </code>
          </div>
          <div className="drift-console__analysis">
            <div className="alert-beacon" aria-hidden="true">
              <i />
              <i />
            </div>
            <p>SEMANTIC CHANGE DETECTED</p>
            <dl>
              <div>
                <dt>Expected</dt>
                <dd>Free users may upload 5 files.</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>Free users may upload 10 files.</dd>
              </div>
            </dl>
            <strong>CONTRACT UNCHANGED · OWNER APPROVAL REQUIRED</strong>
          </div>
        </div>
      </section>

      <section className="agent-interface">
        <div className="marketing-container agent-interface__grid">
          <div className="agent-interface__copy" data-reveal>
            <span className="section-coordinate">07 / MCP</span>
            <Eyebrow>Built for coding agents, independent of them</Eyebrow>
            <h2>Your agent can ask MaruCheck to verify its work.</h2>
            <p>
              Codex, Claude Code, Cursor, and any compatible MCP client receive the same closed tool
              schemas and structured evidence. Agents can run checks and propose changes. They
              cannot approve product intent.
            </p>
            <Link className="text-action text-action--light" href="/docs/mcp">
              Configure the MCP server <Icon name="arrow" />
            </Link>
          </div>
          <div className="agent-transcript" data-reveal>
            <header>
              <span>CODEX / MARU MCP</span>
              <b>
                <i /> CONNECTED
              </b>
            </header>
            <div className="agent-message">
              <small>CODING AGENT</small>
              <p>I updated invoice authorization and the existing tests pass.</p>
            </div>
            <div className="tool-call">
              <span>TOOL CALL</span>
              <code>maru_run_verification</code>
              <pre>{`{
  "diff": "working-tree",
  "includeEvidence": true
}`}</pre>
            </div>
            <div className="tool-result">
              <span>STRUCTURED RESULT · 1.42s</span>
              <div>
                <b>gate</b>
                <strong>blocked</strong>
              </div>
              <div>
                <b>finding</b>
                <code>invoice-access#INV-001</code>
              </div>
              <div>
                <b>severity</b>
                <code>critical</code>
              </div>
              <p>Cross-account regression reproduced. Release blocked.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cli-section">
        <div className="marketing-container cli-section__heading" data-reveal>
          <div>
            <span className="section-coordinate">08 / CLI</span>
            <Eyebrow>Local by default</Eyebrow>
            <h2>One command from change to evidence.</h2>
          </div>
          <p>
            The CLI works offline for deterministic analysis, runs the tools already installed in
            the repository, and stores reviewable artifacts under <code>.maru/</code>.
          </p>
        </div>
        <div className="marketing-container" data-reveal>
          <MarketingTerminal />
        </div>
      </section>

      <section className="proof-console-section">
        <div className="marketing-container proof-console-section__heading" data-reveal>
          <span className="section-coordinate">09 / HOSTED PROOF</span>
          <h2>A decision first. The entire proof trail behind it.</h2>
          <MarketingCta href="/dashboard" secondary>
            Open the dashboard
          </MarketingCta>
        </div>
        <div className="marketing-container release-console" data-reveal>
          <aside>
            <span className="release-console__brand">
              <i /> MARU
            </span>
            <nav aria-label="Dashboard preview navigation">
              <b>Overview</b>
              <span>Projects</span>
              <span>Contracts</span>
              <span>Runs</span>
              <span>Findings</span>
              <span>Coverage</span>
              <span>QA memory</span>
            </nav>
          </aside>
          <div className="release-console__main">
            <header>
              <span>Release overview / maru-web</span>
              <b>commit 8f2c1a7</b>
            </header>
            <section className="release-decision">
              <div className="decision-orbit" aria-hidden="true">
                <i />
                <span>86%</span>
              </div>
              <div>
                <small>RELEASE DECISION</small>
                <h3>One proof gap needs attention.</h3>
                <p>Invoice ownership failed against an approved critical requirement.</p>
              </div>
              <strong>BLOCKED</strong>
            </section>
            <div className="release-console__metrics">
              <div>
                <span>Risk</span>
                <b>92/100</b>
              </div>
              <div>
                <span>Evidence</span>
                <b>38</b>
              </div>
              <div>
                <span>Requirements</span>
                <b>26/33</b>
              </div>
            </div>
            <div className="release-finding">
              <span>FIND-0092</span>
              <div>
                <b>Invoice ownership check can be bypassed</b>
                <small>invoice-access#INV-001 · Critical</small>
              </div>
              <strong>OPEN →</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="local-boundary">
        <div className="marketing-container local-boundary__grid" data-reveal>
          <span className="section-coordinate">10 / BOUNDARY</span>
          <h2>Your source stays where it runs.</h2>
          <div
            className="boundary-diagram"
            aria-label="Local execution and hosted evidence boundary"
          >
            <div>
              <span>REPOSITORY / CI</span>
              <strong>Source · tests · secrets</strong>
              <b>LOCAL</b>
            </div>
            <i aria-hidden="true" />
            <div>
              <span>MARUCHECK CLOUD</span>
              <strong>Contracts · findings · evidence</strong>
              <b>CONFIGURED</b>
            </div>
          </div>
          <p>
            Execution happens in the repository or CI runner. Teams choose which metadata and
            evidence references become shared release proof.
          </p>
        </div>
      </section>
    </>
  );
}
