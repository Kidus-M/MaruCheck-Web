import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

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
        MaruCheck installs from npm, runs against the repository you are already working in, and
        keeps its contracts and evidence under that repository’s <code>.maru</code> directory.
      </p>
      <DocsCallout>
        <strong>Repository boundary</strong>
        <p>
          The web product and CLI stay in separate sibling repositories. They can evolve and release
          independently without nested Git history.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>1. Initialize your repository</h2>
        <CodeBlock>{`cd /path/to/project\nnpx marucheck init`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>2. Check the local prerequisites</h2>
        <CodeBlock>{`npx marucheck doctor\nnpx marucheck scan`}</CodeBlock>
        <p>Doctor reports missing tools explicitly; it does not silently install test runners.</p>
      </section>
      <section className="docs-section">
        <h2>3. Add approved intent</h2>
        <CodeBlock>{`npx marucheck contract create --from requirements.md\nnpx marucheck contract validate`}</CodeBlock>
        <p>
          Review the generated MaruCheck files before committing them. A Quality Contract represents
          approved product intent and should receive the same care as application code.
        </p>
      </section>
      <section className="docs-section">
        <h2>4. Run verification</h2>
        <CodeBlock>{`npx marucheck risk --diff\nnpx marucheck verify --diff`}</CodeBlock>
        <p>
          Use the command output to inspect the gate, findings, and evidence references. Pin an exact
          <code>marucheck</code> version in CI so every contributor runs the same verifier.
        </p>
      </section>
    </>
  );
}
