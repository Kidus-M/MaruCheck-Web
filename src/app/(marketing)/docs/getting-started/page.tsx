import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import {
  MARUCHECK_CLI_SPEC,
  MARUCHECK_CLI_VERSION,
  MARUCHECK_CONTRIBUTING_URL,
  MARUCHECK_SOURCE_URL,
} from "@/lib/public-release";

export const metadata: Metadata = {
  title: "Getting started",
  description: "Install MaruCheck and verify an existing project.",
};

export default function GettingStartedPage() {
  return (
    <>
      <span className="docs-kicker">Start here</span>
      <h1>Getting started</h1>
      <p className="docs-lead">
        Start with one real change in a repository you already use. MaruCheck can produce an
        inspectable local release decision before you connect a dashboard, an AI client, or CI.
      </p>
      <DocsCallout>
        <strong>CLI first; MCP when you want agent assistance.</strong>
        <p>
          You do not need MCP for local verification. Connect MaruCheck&apos;s MCP server when you
          want Codex, Claude Code, Cursor, or another compatible client to inspect contracts, assess
          risk, run verification, and coordinate a separate Challenger review. MaruCheck uses the AI
          client you already have—it does not require a second model provider or API key.
        </p>
      </DocsCallout>
      <DocsCallout>
        <strong>Before you begin</strong>
        <p>
          MaruCheck v{MARUCHECK_CLI_VERSION} requires Node.js 24 or newer, npm 11 or newer, and Git.
          Run these commands from the root of the Next.js, React, or TypeScript repository you want
          to verify.
        </p>
      </DocsCallout>
      <DocsCallout>
        <strong>Open source and inspectable.</strong>
        <p>
          MaruCheck is MIT licensed. <a href={MARUCHECK_SOURCE_URL}>Read the verifier</a> or{" "}
          <a href={MARUCHECK_CONTRIBUTING_URL}>contribute a focused fix</a> before trusting it in a
          release path.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>1. Run one exact-version trial</h2>
        <CodeBlock>{`cd /path/to/your-project\nnpx --yes ${MARUCHECK_CLI_SPEC} --version\nnpx --yes ${MARUCHECK_CLI_SPEC} init`}</CodeBlock>
        <p>
          This is the fastest path for one local trial. Initialization creates the{" "}
          <code>.maru/</code> workspace without overwriting existing configuration. It also manages
          ignore rules for generated plans, run artifacts, and local connection credentials.
        </p>
      </section>
      <section className="docs-section">
        <h2>2. Pin it before regular use</h2>
        <CodeBlock>{`npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}\nnpx --no-install maru init`}</CodeBlock>
        <p>
          Pinning writes the verifier into <code>package.json</code> and{" "}
          <code>package-lock.json</code>, so local contributors and CI execute the same release. Use{" "}
          <code>npx --no-install maru</code>
          after installation to prevent an implicit download.
        </p>
      </section>
      <section className="docs-section">
        <h2>3. Inspect the repository</h2>
        <CodeBlock>{`npx --no-install maru doctor\nnpx --no-install maru scan`}</CodeBlock>
        <p>
          Doctor reports missing prerequisites explicitly. Scan records detected routes, tests,
          dependencies, CI, and source structure in <code>.maru/generated/project-scan.json</code>.
          Neither command silently installs project tools. Commit <code>.maru/maru.yml</code>,
          reviewed contracts, and QA memory; do not commit <code>.maru/generated/</code>,{" "}
          <code>.maru/artifacts/</code>, or <code>.maru/connection.env</code>.
        </p>
      </section>
      <section className="docs-section">
        <h2>4. Start with one feature contract</h2>
        <CodeBlock>{`npx --no-install maru contract create --from requirements.md\nnpx --no-install maru contract validate\nnpx --no-install maru contract approve <contract-id> --by <owner>`}</CodeBlock>
        <p>
          Use a small requirements file for the feature being changed, not the entire product. Draft
          creation does not approve anything. Review the generated YAML under{" "}
          <code>.maru/contracts/</code> before an accountable owner approves it. Draft and review
          policies remain advisory; approval is what activates their blocking requirements.
        </p>
      </section>
      <section className="docs-section">
        <h2>5. Verify the current change</h2>
        <CodeBlock>{`npx --no-install maru risk --diff\nnpx --no-install maru plan --diff\nnpx --no-install maru verify --diff`}</CodeBlock>
        <p>
          Review the risk reasons and plan before execution. Verification runs only selected tools
          already installed in the project, prints a passed or blocked gate, and writes the complete
          report under <code>.maru/artifacts/runs/&lt;run-id&gt;/report.json</code>. A missing
          adapter is reported as unavailable or inconclusive, never as a pass.
        </p>
      </section>
      <section className="docs-section">
        <h2>6. Connect the agent you already use</h2>
        <p>
          Follow the <Link href="/docs/mcp">MCP connection guide</Link> for Codex, Claude Code, or
          Cursor. Once connected, the coding agent can call MaruCheck&apos;s bounded local tools
          instead of scraping terminal output.
        </p>
        <ol className="docs-steps">
          <li>
            <b>Builder</b>
            <span>Your existing coding agent implements the change.</span>
          </li>
          <li>
            <b>Verifier</b>
            <span>MaruCheck deterministically checks contracts, risk, tests, and evidence.</span>
          </li>
          <li>
            <b>Challenger</b>
            <span>A fresh thread or subagent proposes failure scenarios for risky work.</span>
          </li>
          <li>
            <b>Decision</b>
            <span>Executed checks and evidence—not the agent&apos;s opinion—pass or block.</span>
          </li>
        </ol>
      </section>
      <section className="docs-section">
        <h2>7. Add shared infrastructure when useful</h2>
        <ol>
          <li>
            Optionally <Link href="/docs/report-ingestion">connect a dashboard project</Link>, save
            its token in the ignored connection file, and upload one completed report.
          </li>
          <li>
            Add the <Link href="/docs/ci">GitHub pull-request gate</Link> only after the local
            workflow and contract policy behave as intended.
          </li>
          <li>
            Use drift protection, QA memory, Challenger review, and mutation verification where the
            risk justifies the additional review or execution time.
          </li>
        </ol>
      </section>
    </>
  );
}
