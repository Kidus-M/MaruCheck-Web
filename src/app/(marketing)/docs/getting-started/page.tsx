import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { MARUCHECK_CLI_SPEC, MARUCHECK_CLI_VERSION } from "@/lib/public-release";

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
        Install MaruCheck from npm, point it at the repository you already work in, and produce an
        inspectable release decision without creating a cloud account.
      </p>
      <DocsCallout>
        <strong>Before you begin</strong>
        <p>
          MaruCheck v{MARUCHECK_CLI_VERSION} requires Node.js 24 or newer, npm 11 or newer, and Git.
          Run these commands from the root of the Next.js, React, or TypeScript repository you want
          to verify.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>1. Try the published CLI</h2>
        <CodeBlock>{`cd /path/to/your-project\nnpx --yes ${MARUCHECK_CLI_SPEC} --version\nnpx --yes ${MARUCHECK_CLI_SPEC} init`}</CodeBlock>
        <p>
          This is the fastest path for one local trial. Initialization creates <code>.maru/</code>
          configuration, contract, generated-data, memory, and artifact directories without
          overwriting an existing configuration.
        </p>
      </section>
      <section className="docs-section">
        <h2>2. Pin it for a project or team</h2>
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
          Neither command silently installs project tools.
        </p>
      </section>
      <section className="docs-section">
        <h2>4. Add approved intent</h2>
        <CodeBlock>{`npx --no-install maru contract create --from requirements.md\nnpx --no-install maru contract validate\nnpx --no-install maru contract approve <contract-id> --by <owner>`}</CodeBlock>
        <p>
          Draft creation does not approve anything. Review the YAML under{" "}
          <code>.maru/contracts/</code>
          before an accountable person approves it. Commit reviewed configuration and contracts;
          keep raw artifacts out of Git.
        </p>
      </section>
      <section className="docs-section">
        <h2>5. Verify the current change</h2>
        <CodeBlock>{`npx --no-install maru risk --diff\nnpx --no-install maru plan --diff\nnpx --no-install maru verify --diff`}</CodeBlock>
        <p>
          Review the risk reasons and plan before execution. Verification runs selected installed
          checks, prints a passed or blocked gate, and writes the complete report under
          <code>.maru/artifacts/runs/&lt;run-id&gt;/report.json</code>.
        </p>
      </section>
      <section className="docs-section">
        <h2>What to do next</h2>
        <ul>
          <li>Use the CLI reference for drift, QA memory, mutation, and Challenger commands.</li>
          <li>Install the generated GitHub Actions gate for pull requests.</li>
          <li>Connect the MCP server to Codex, Claude Code, Cursor, or another MCP client.</li>
          <li>
            Optionally <Link href="/docs/report-ingestion">connect a dashboard project</Link> and
            explicitly upload one completed report for shared proof metadata.
          </li>
        </ul>
      </section>
    </>
  );
}
