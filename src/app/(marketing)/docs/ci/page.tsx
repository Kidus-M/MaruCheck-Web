import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { MARUCHECK_CLI_SPEC } from "@/lib/public-release";

export const metadata: Metadata = {
  title: "CI integration",
  description: "Run MaruCheck as an evidence-backed continuous integration gate.",
};

export default function CiDocsPage() {
  return (
    <>
      <span className="docs-kicker">Automation</span>
      <h1>CI integration</h1>
      <p className="docs-lead">
        Run the same verification loop on pull requests so the release decision follows the
        change—not a reviewer’s memory.
      </p>
      <section className="docs-section">
        <h2>1. Pin the published package</h2>
        <CodeBlock>{`npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}\nnpx --no-install maru init`}</CodeBlock>
        <p>
          Commit <code>package.json</code>, <code>package-lock.json</code>, and the reviewed
          <code>.maru</code> configuration. The workflow uses <code>npm ci</code> and
          <code>npx --no-install</code>, so it cannot drift to an unreviewed CLI version.
        </p>
      </section>
      <section className="docs-section">
        <h2>2. Generate the pull-request workflow</h2>
        <CodeBlock>{`npx --no-install maru ci init\ngit diff -- .github/workflows/marucheck.yml`}</CodeBlock>
        <p>
          Review and commit the generated workflow. Running <code>maru ci init</code> again is
          idempotent; if the target file contains custom content, MaruCheck refuses to overwrite it.
        </p>
      </section>
      <DocsCallout>
        <strong>No hosted account, GitHub App, or repository secret is required.</strong>
        <p>
          The generated workflow runs only on pull requests with read-only repository permission.
          It does not use <code>pull_request_target</code> and does not persist checkout credentials.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>3. What the generated job does</h2>
        <CodeBlock label="GitHub Actions">{`- name: Install project dependencies\n  run: npm ci\n\n- name: Verify changed behavior\n  run: npx --no-install maru ci verify`}</CodeBlock>
        <ol>
          <li>Checks out the pull-request revision with read-only permissions.</li>
          <li>Uses Node.js 24 and the committed npm lockfile.</li>
          <li>Runs the same planner, adapters, evidence model, and release gate as local verification.</li>
          <li>Writes a readable GitHub job summary before returning the gate exit code.</li>
          <li>Uploads hidden <code>.maru</code> evidence even when the gate blocks.</li>
        </ol>
      </section>
      <section className="docs-section">
        <h2>4. Require the gate</h2>
        <p>
          After the workflow has run once, add its <code>ProofLayer</code> check to the repository’s
          branch ruleset if every protected pull request should require MaruCheck. This is a GitHub
          repository policy; the CLI does not change it automatically.
        </p>
      </section>
      <section className="docs-section">
        <h2>Evidence and hosted proof</h2>
        <p>
          Keep source execution inside the runner. Upload only the artifacts your policy permits,
          apply a retention period, and avoid placing secrets or raw sensitive payloads in evidence
          output. To share normalized proof in the dashboard, add the explicit
          <Link href="/docs/report-ingestion"> hosted report step</Link> separately.
        </p>
      </section>
    </>
  );
}
