import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { MARUCHECK_CLI_SPEC } from "@/lib/public-release";

export const metadata: Metadata = {
  title: "Hosted verification reports",
  description: "Connect a project and send completed MaruCheck proof metadata to the dashboard.",
};

export default function ReportIngestionDocsPage() {
  return (
    <>
      <span className="docs-kicker">Optional hosted proof</span>
      <h1>Send a report to the dashboard</h1>
      <p className="docs-lead">
        Verification still runs in your repository. One explicit CLI command sends the bounded
        report and artifact references so your team can inspect runs, findings, contracts, and
        coverage together.
      </p>
      <DocsCallout>
        <strong>Upload is always explicit.</strong>
        <p>
          <code>maru upload</code> sends the selected report only. It does not send source code,
          execute repository commands in the hosted service, or upload merely because you signed in.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>1. Connect the project</h2>
        <ol>
          <li>
            Sign in and open <Link href="/projects/connect">Connect project</Link>.
          </li>
          <li>
            Use the same project name reported by <code>maru scan</code>.
          </li>
          <li>
            Copy the one-time <code>maru_…</code> token before leaving the confirmation screen.
          </li>
          <li>
            Store it as <code>MARUCHECK_TOKEN</code> in your shell or CI provider’s encrypted
            secrets. Never add it to a command committed to the repository.
          </li>
        </ol>
        <p>
          The dashboard stores only a token hash. Owners can rotate or revoke the credential from
          the project page if the original token is lost or exposed.
        </p>
      </section>
      <section className="docs-section">
        <h2>2. Produce the local report</h2>
        <CodeBlock>{`npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}\nnpx --no-install maru verify --diff\n# Copy the report path printed by the command:\n# .maru/artifacts/runs/<run-id>/report.json`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>3. Upload that report</h2>
        <p>
          Set <code>MARUCHECK_TOKEN</code> outside the command, then use the exact host shown in
          your browser. The CLI reads the current branch, commit SHA, and commit title from Git.
        </p>
        <CodeBlock>{`npx --no-install maru upload \\\n  --report .maru/artifacts/runs/<run-id>/report.json \\\n  --url https://your-marucheck-host`}</CodeBlock>
        <p>
          You may set <code>MARUCHECK_URL</code> instead of passing <code>--url</code>. Remote hosts
          require HTTPS; HTTP is accepted only for local development. A successful upload prints the
          accepted run ID and dashboard link.
        </p>
      </section>
      <section className="docs-section">
        <h2>What crosses the boundary</h2>
        <ul>
          <li>Gate status, risk, findings, requirement coverage, and evidence metadata.</li>
          <li>Artifact references such as local or CI paths—not artifact file contents.</li>
          <li>The current branch, commit SHA, and commit title.</li>
          <li>No source code and no repository secrets.</li>
        </ul>
      </section>
      <section className="docs-section">
        <h2>Common failures</h2>
        <ul>
          <li>
            <code>HOSTED_AUTH_REQUIRED</code>: <code>MARUCHECK_TOKEN</code> is missing or malformed.
          </li>
          <li>
            <code>401</code>: the project token is invalid, expired, or revoked.
          </li>
          <li>
            <code>409</code>: the report project name differs from the connected project.
          </li>
          <li>
            <code>413</code>: the versioned request exceeds the 2 MB boundary.
          </li>
        </ul>
      </section>
    </>
  );
}
