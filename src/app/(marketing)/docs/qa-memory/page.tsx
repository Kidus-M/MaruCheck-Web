import Link from "next/link";
import { DocsPageSchema } from "@/components/docs-schema";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { docsMetadata } from "@/lib/docs-registry";

export const metadata = docsMetadata("qa-memory");

export default function QaMemoryDocsPage() {
  return (
    <>
      <span className="docs-kicker">Core concept</span>
      <h1>QA Memory</h1>
      <p className="docs-lead">
        QA Memory is MaruCheck&apos;s record of failures that were actually confirmed. When code
        related to one of those failures changes again, MaruCheck recalls it and forces the matching
        regression test back into the verification plan — so a bug that has already been diagnosed
        once cannot quietly return in a later AI-authored change.
      </p>
      <DocsCallout>
        <strong>Only confirmed failures become memory.</strong>
        <p>
          A red test run, a noisy stack trace, or an unreviewed production event is not memory. An
          entry becomes active only after a human confirms the root cause and links a real
          regression test, which keeps the record small enough to stay trustworthy.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Why AI-authored changes need memory</h2>
        <p>
          A coding agent starts each task without the history of what previously broke. It can
          reintroduce an old defect in unfamiliar form and still produce a green suite, because the
          test that once caught the defect is not part of the change it reasoned about. QA Memory
          supplies that history deterministically instead of hoping the model remembers it.
        </p>
      </section>
      <section className="docs-section">
        <h2>Where memory is stored</h2>
        <p>
          Confirmed QA memory is stored under <code>.maru/memory/</code> in the repository. It is
          reviewed content, so commit it alongside <code>.maru/maru.yml</code> and your approved
          contracts. Generated plans under <code>.maru/generated/</code> and run artifacts under{" "}
          <code>.maru/artifacts/</code> stay out of version control.
        </p>
      </section>
      <section className="docs-section">
        <h2>Search what the project already learned</h2>
        <p>
          Before writing a test for a risky area, check whether the failure mode is already
          recorded. Search returns the confirmed bugs and the regression tests linked to them.
        </p>
        <CodeBlock>{`npx --no-install maru memory search "authorization"`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>How recall enters a verification plan</h2>
        <ol className="docs-steps">
          <li>
            <b>Diff</b>
            <span>MaruCheck reads the changed paths in the real Git diff.</span>
          </li>
          <li>
            <b>Match</b>
            <span>Memory entries related to those paths are recalled.</span>
          </li>
          <li>
            <b>Plan</b>
            <span>
              Their linked regression tests are added to the{" "}
              <Link href="/docs/cli">verification plan</Link>, not left to reviewer discretion.
            </span>
          </li>
          <li>
            <b>Risk</b>
            <span>A recalled failure also raises the explainable risk score for the change.</span>
          </li>
        </ol>
      </section>
      <section className="docs-section">
        <h2>Where memory comes from</h2>
        <p>
          Memory is created from failures your team confirms locally, and — when you connect the
          hosted console — from reviewed{" "}
          <Link href="/docs/production-feedback">production feedback</Link>. That review path is
          deliberately strict: approval requires a confirmed root cause, a Vitest or Playwright
          adapter, a stable regression ID, and a project-relative test path. Rejecting a proposal
          creates no memory and no test link.
        </p>
      </section>
      <section className="docs-section">
        <h2>What memory does not do</h2>
        <ul>
          <li>It does not change a Quality Contract or approve new behavior.</li>
          <li>It does not execute a proposed reproduction on its own.</li>
          <li>
            It does not replace <Link href="/docs/quality-contracts">contracts</Link>; contracts
            hold the promise, memory holds the failures that promise has already survived.
          </li>
        </ul>
      </section>

      <DocsPageSchema slug="qa-memory" />
    </>
  );
}
