import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

export const metadata: Metadata = { title: "MCP workflow", description: "Connect MaruCheck tools to Codex and other MCP-compatible clients." };

export default function McpDocsPage() {
  return <>
    <span className="docs-kicker">Agent workflow</span><h1>MCP integration</h1>
    <p className="docs-lead">MaruCheck exposes structured tools over the Model Context Protocol so an agent can inspect contracts and run verification without scraping terminal text.</p>
    <section className="docs-section"><h2>Codex today</h2><p>Point your Codex MCP configuration at the server command from the CLI repository, then restart the client so it discovers the MaruCheck tools.</p><CodeBlock>{`# Build and inspect the current MCP server command\ncd ../maru-cli\nnpm install\nnpm run build\nnpm run dev -- mcp --help`}</CodeBlock></section>
    <DocsCallout><strong>Client-neutral protocol</strong><p>The integration is designed around MCP, not Codex-specific behavior. Other MCP-compatible clients can connect to the same server command and tool schemas.</p></DocsCallout>
    <section className="docs-section"><h2>Safe operating pattern</h2><ol><li>Let the client discover the available MaruCheck tools.</li><li>Inspect contracts and project state before requesting a run.</li><li>Treat findings and evidence as inputs to judgment, not instructions to rewrite code automatically.</li><li>Keep destructive or external actions behind explicit user approval.</li></ol></section>
  </>;
}
