import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Documentation", description: "Learn the MaruCheck model and connect its local verification workflow." };

export default function DocsHomePage() {
  return <>
    <span className="docs-kicker">MaruCheck documentation</span>
    <h1>Build a release proof loop.</h1>
    <p className="docs-lead">Learn how Quality Contracts, change-risk analysis, verification runs, findings, and retained evidence fit together.</p>
    <div className="docs-card-grid">
      <Link href="/docs/getting-started"><span>01</span><h2>Getting started</h2><p>Run the current CLI locally and inspect the generated project structure.</p></Link>
      <Link href="/docs/quality-contracts"><span>02</span><h2>Quality Contracts</h2><p>Write behavior that remains precise enough to verify across implementations.</p></Link>
      <Link href="/docs/ci"><span>03</span><h2>CI integration</h2><p>Use verification as an inspectable pull-request and release gate.</p></Link>
      <Link href="/docs/mcp"><span>04</span><h2>MCP workflow</h2><p>Let Codex and other MCP clients use the same structured MaruCheck tools.</p></Link>
    </div>
    <section className="docs-section"><h2>The model in one minute</h2><ol className="docs-steps"><li><b>Contract</b><span>records approved behavior</span></li><li><b>Diff</b><span>identifies affected risk</span></li><li><b>Run</b><span>challenges the risky paths</span></li><li><b>Evidence</b><span>supports the release decision</span></li></ol></section>
  </>;
}
