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
          <code>maru upload</code> selects the newest completed report and sends that report only.
          It does not send source code, execute repository commands in the hosted service, or upload
          merely because you signed in.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>1. Connect the project</h2>
        <ol>
          <li>
            Sign in and open <Link href="/projects/connect">Connect project</Link>.
          </li>
          <li>
            Choose the dashboard display name your team will recognize. It does not need to match
            the local package or repository name.
          </li>
          <li>Copy the two-line connection setup before leaving the confirmation screen.</li>
          <li>
            Paste it into <code>.maru/connection.env</code>. <code>maru init</code> adds that file
            to the nested Git ignore rules automatically.
          </li>
        </ol>
        <p>
          The dashboard stores only a token hash. Owners can rotate or revoke the credential from
          the project page if the original token is lost or exposed.
        </p>
      </section>
      <section className="docs-section">
        <h2>2. Produce the local report</h2>
        <CodeBlock>{`npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}\nnpx --no-install maru init\nnpx --no-install maru verify --diff`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>3. Upload that report</h2>
        <p>
          MaruCheck reads the ignored connection file and selects the valid report with the newest
          generated timestamp, so you do not need to find or type a run ID. It also reads the
          current branch, commit SHA, and commit title from Git.
        </p>
        <CodeBlock>{`npx --no-install maru upload`}</CodeBlock>
        <p>
          CI may provide <code>MARUCHECK_TOKEN</code> and <code>MARUCHECK_URL</code> as encrypted
          environment variables instead. Use <code>--report</code> or <code>--url</code> only when a
          particular run or host must override those defaults. A successful upload prints the
          selected report path, accepted run ID, and dashboard link.
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
            <code>HOSTED_REPORT_NOT_FOUND</code>: run <code>maru verify --diff</code> first.
          </li>
          <li>
            <code>401</code>: the project token is invalid, expired, or revoked.
          </li>
          <li>
            <code>409</code>: the same run ID already exists with different submitted content; make
            a new verification run instead of changing an existing run.
          </li>
          <li>
            <code>413</code>: the versioned request exceeds the 2 MB boundary.
          </li>
        </ul>
        <p>
          The local report name may differ from the dashboard display name. The project-scoped token
          determines which connected project receives the run.
        </p>
      </section>
    </>
  );
}
