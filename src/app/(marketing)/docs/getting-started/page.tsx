import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

export const metadata: Metadata = { title: "Getting started", description: "Run MaruCheck locally from the current workspace." };

export default function GettingStartedPage() {
  return <>
    <span className="docs-kicker">Start here</span><h1>Getting started</h1>
    <p className="docs-lead">The CLI is currently developed as the separate <code>maru-cli</code> repository. Until its npm publication workflow is complete, run it from source.</p>
    <DocsCallout><strong>Repository boundary</strong><p>The web product and CLI stay in separate sibling repositories. They can evolve and release independently without nested Git history.</p></DocsCallout>
    <section className="docs-section"><h2>1. Install the CLI workspace</h2><CodeBlock>{`cd ../maru-cli\nnpm install\nnpm run build`}</CodeBlock></section>
    <section className="docs-section"><h2>2. See the available commands</h2><CodeBlock>{`npm run dev -- --help`}</CodeBlock><p>The command list is the source of truth while the package is in active development.</p></section>
    <section className="docs-section"><h2>3. Initialize a target project</h2><CodeBlock>{`npm run dev -- init /path/to/project`}</CodeBlock><p>Review the generated MaruCheck files before committing them. A Quality Contract represents approved product intent and should receive the same care as application code.</p></section>
    <section className="docs-section"><h2>4. Run verification</h2><CodeBlock>{`npm run dev -- check /path/to/project`}</CodeBlock><p>Use the command output to inspect the gate, findings, and evidence references. Command details may continue to change until the first public CLI release.</p></section>
  </>;
}
