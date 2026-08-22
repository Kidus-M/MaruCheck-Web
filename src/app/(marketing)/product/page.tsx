import type { Metadata } from "next";
import { MarketingCta } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "Product",
  description:
    "See how MaruCheck turns a changed line into independent, inspectable release proof.",
};

export default function ProductPage() {
  return (
    <>
      <section className="product-v2-hero" data-gsap-hero>
        <div className="product-v2-hero__grid" aria-hidden="true" />
        <div className="marketing-container">
          <p className="v2-kicker">
            <span>PRODUCT / SYSTEM</span> From changed line to release decision
          </p>
          <h1>
            <span className="hero-word-clip">
              <span className="hero-word">Software changed.</span>
            </span>
            <span className="hero-word-clip hero-word-clip--offset">
              <span className="hero-word">
                Prove the promise <em>didn’t.</em>
              </span>
            </span>
          </h1>
          <div className="product-v2-hero__foot">
            <p>
              MaruCheck connects approved behavior, the real Git diff, historical failures, targeted
              checks, and reproducible evidence in one accountable chain.
            </p>
            <div className="product-v2-hero__route">
              <span>INPUT</span>
              <b>git diff</b>
              <i>→</i>
              <span>OUTPUT</span>
              <b>ship / block</b>
            </div>
          </div>
        </div>
      </section>

      <section className="product-act product-act--contract">
        <div className="marketing-container product-act__heading" data-gsap>
          <p className="section-index">ACT 01 — DEFINE</p>
          <h2>First, make the promise executable.</h2>
          <p>
            Quality Contracts preserve the behavior that must remain true—even when an agent
            rewrites both code and tests.
          </p>
        </div>
        <div className="marketing-container product-contract" data-gsap>
          <div className="product-contract__code">
            <header>
              <span>subscription-management.yml</span>
              <b>APPROVED · v4</b>
            </header>
            <pre>{`feature: subscription-management
criticality: high
owners: [product, engineering]

requirements:
  - id: SUB-004
    statement: Cancellation keeps Pro active
      until the current billing period ends.

evidence_policy:
  blocking: [SUB-004]`}</pre>
          </div>
          <div className="product-contract__trace">
            <span>SUB-004</span>
            <h3>Protected behavior</h3>
            <ol>
              <li>
                <i />
                Approved by an accountable owner
              </li>
              <li>
                <i />
                Mapped to Vitest + Playwright
              </li>
              <li>
                <i />
                Versioned when intent changes
              </li>
            </ol>
            <strong>INTENT LOADED</strong>
          </div>
        </div>
      </section>

      <section className="product-act product-act--risk">
        <div
          className="marketing-container product-act__heading product-act__heading--dark"
          data-gsap
        >
          <p className="section-index">ACT 02 — CHALLENGE</p>
          <h2>Then, spend proof where the change can hurt.</h2>
          <p>
            Risk is deterministic. Changed paths, critical contracts, coverage gaps, and QA Memory
            each explain their contribution.
          </p>
        </div>
        <div className="marketing-container product-risk-flow" data-gsap>
          <article>
            <span>01 / DIFF</span>
            <h3>3 files changed</h3>
            <code>src/api/invoices/[id]/route.ts</code>
            <code>src/services/invoices.ts</code>
            <code>tests/invoices.test.ts</code>
          </article>
          <i data-gsap-line aria-hidden="true" />
          <article>
            <span>02 / MEMORY</span>
            <h3>MEM-0143 recalled</h3>
            <p>A previous invoice-ownership bypass touched the same authorization boundary.</p>
            <b>+25 RISK</b>
          </article>
          <i data-gsap-line aria-hidden="true" />
          <article className="is-risk">
            <span>03 / ASSESS</span>
            <strong>
              92<small>/100</small>
            </strong>
            <h3>Critical</h3>
            <p>
              Security, API, contract regression, and the recorded cross-account test enter the
              plan.
            </p>
          </article>
        </div>
      </section>

      <section className="product-act product-act--evidence">
        <div className="marketing-container product-evidence-grid">
          <div className="product-act__heading" data-gsap>
            <p className="section-index">ACT 03 — DECIDE</p>
            <h2>A gate you can argue with.</h2>
            <p>
              Every result resolves to expected behavior, observed behavior, reproduction, and the
              evidence that supports the decision.
            </p>
          </div>
          <div className="product-evidence" data-gsap>
            <header>
              <span>RUN-1048 / RELEASE EVIDENCE</span>
              <b>38 OBJECTS</b>
            </header>
            <div>
              <span>Requirement</span>
              <strong>invoice-access#INV-001</strong>
            </div>
            <div>
              <span>Expected</span>
              <strong>Users only read invoices owned by their account.</strong>
            </div>
            <div className="is-fail">
              <span>Observed</span>
              <strong>Cross-account invoice payload returned.</strong>
            </div>
            <div>
              <span>Reproduce</span>
              <code>npx vitest run tests/regressions/cross-account.test.ts</code>
            </div>
            <footer>
              <span>VERIFICATION GATE</span>
              <b>BLOCKED</b>
            </footer>
          </div>
        </div>
      </section>

      <section className="product-principles-v2">
        <div className="marketing-container" data-gsap>
          <p className="section-index">OPERATING RULES</p>
          <h2>The author does not grade the work.</h2>
          <div>
            <article>
              <span>01</span>
              <h3>Independent by design</h3>
              <p>The coding agent can request verification. It cannot approve product intent.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Inconclusive stays visible</h3>
              <p>A missing tool, test, or requirement never gets rewritten into a pass.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Source stays local</h3>
              <p>
                Execution happens in the repository or CI; teams choose which evidence becomes
                shared proof.
              </p>
            </article>
          </div>
          <MarketingCta href="/docs/getting-started">Run your first verification</MarketingCta>
        </div>
      </section>
    </>
  );
}
