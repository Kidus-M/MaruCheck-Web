export function VerificationDemo() {
  return (
    <div className="verification-deck" aria-label="Animated MaruCheck verification sequence">
      <div className="verification-deck__topbar">
        <span className="deck-product">
          <i /> MARU / VERIFY
        </span>
        <span className="deck-branch">feat/subscription-limits</span>
        <span className="deck-live">
          <i /> ANALYZING
        </span>
      </div>

      <div className="verification-deck__body">
        <section className="patch-panel">
          <header>
            <span>AGENT PATCH</span>
            <b>2 files changed</b>
          </header>
          <div className="patch-file">
            <span>src/subscriptions/limits.ts</span>
            <small>+1 −1</small>
          </div>
          <pre aria-label="Code change">
            <code>
              <span className="line-context"> export const limits = &#123;</span>
              <span className="line-removed">- FREE_LIMIT: 5,</span>
              <span className="line-added">+ FREE_LIMIT: 10,</span>
              <span className="line-context"> PRO_LIMIT: Infinity</span>
              <span className="line-context"> &#125;</span>
            </code>
          </pre>
          <div className="agent-note">
            <span>CODING AGENT</span>
            <p>Implementation updated. Existing tests pass.</p>
          </div>
        </section>

        <section className="sequence-panel" aria-label="Verification stages">
          <header>
            <span>VERIFICATION SEQUENCE</span>
            <small>RUN-1048</small>
          </header>
          <ol>
            <li className="sequence-step sequence-step--one">
              <span className="sequence-index">01</span>
              <i />
              <div>
                <strong>Diff classified</strong>
                <small>business-logic · billing</small>
              </div>
              <b>DONE</b>
            </li>
            <li className="sequence-step sequence-step--two">
              <span className="sequence-index">02</span>
              <i />
              <div>
                <strong>Risk assessed</strong>
                <small>contract + historical signals</small>
              </div>
              <b className="sequence-risk">HIGH · 72</b>
            </li>
            <li className="sequence-step sequence-step--three">
              <span className="sequence-index">03</span>
              <i />
              <div>
                <strong>Contract checked</strong>
                <small>subscription-management#SUB-001</small>
              </div>
              <b>CONFLICT</b>
            </li>
            <li className="sequence-step sequence-step--four">
              <span className="sequence-index">04</span>
              <i />
              <div>
                <strong>Evidence normalized</strong>
                <small>expected 5 · observed 10</small>
              </div>
              <b>1 FINDING</b>
            </li>
          </ol>
        </section>

        <aside className="gate-panel">
          <div className="gate-panel__radar" aria-hidden="true">
            <i />
            <i />
            <span />
          </div>
          <p>RELEASE GATE</p>
          <strong>BLOCKED</strong>
          <span>Approved behavior changed without an approved contract amendment.</span>
          <dl>
            <div>
              <dt>Risk</dt>
              <dd>72 / 100</dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>Critical</dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>38 objects</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="verification-deck__terminal">
        <span className="terminal-prompt">$</span>
        <code>maru verify --diff</code>
        <span className="terminal-stream">Analyzing changed behavior</span>
        <b>VERIFICATION GATE: BLOCKED</b>
      </div>
      <div className="deck-scan" aria-hidden="true" />
    </div>
  );
}
