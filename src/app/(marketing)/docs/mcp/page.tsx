import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { MARUCHECK_CLI_SPEC } from "@/lib/public-release";

export const metadata: Metadata = {
  title: "MCP workflow",
  description: "Connect MaruCheck tools to Codex and other MCP-compatible clients.",
};

export default function McpDocsPage() {
  return (
    <>
      <span className="docs-kicker">Agent workflow</span>
      <h1>MCP integration</h1>
      <p className="docs-lead">
        MaruCheck exposes structured tools over the Model Context Protocol so an agent can inspect
        contracts, assess the real Git diff, and run local verification without scraping terminal
        text or sending source code to a MaruCheck model service.
      </p>
      <section className="docs-section">
        <h2>Choose a package strategy</h2>
        <p>
          For a quick trial, let the MCP client start the exact npm release with <code>npx</code>. For
          a team, install <code>{MARUCHECK_CLI_SPEC}</code> in the project and replace the arguments
          with <code>[&quot;--no-install&quot;, &quot;maru&quot;, &quot;mcp&quot;]</code>.
        </p>
      </section>
      <section className="docs-section">
        <h2>Codex</h2>
        <p>Add this to the trusted project’s <code>.codex/config.toml</code>:</p>
        <CodeBlock label="TOML">{`[mcp_servers.maru]\ncommand = "npx"\nargs = ["--yes", "${MARUCHECK_CLI_SPEC}", "mcp"]\nrequired = false\ndefault_tools_approval_mode = "writes"`}</CodeBlock>
        <p>
          Restart Codex after changing configuration, trust the project when prompted, and use
          <code>/mcp</code> to inspect the connection.
        </p>
      </section>
      <section className="docs-section">
        <h2>Claude Code</h2>
        <p>From the repository you want MaruCheck to inspect:</p>
        <CodeBlock>{`claude mcp add maru --scope project -- npx --yes ${MARUCHECK_CLI_SPEC} mcp\nclaude mcp list`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>Cursor</h2>
        <p>Add <code>.cursor/mcp.json</code> to the target repository:</p>
        <CodeBlock label="JSON">{`{
  "mcpServers": {
    "maru": {
      "command": "npx",
      "args": ["--yes", "${MARUCHECK_CLI_SPEC}", "mcp"]
    }
  }
}`}</CodeBlock>
        <p>Restart Cursor, open MCP settings, and enable the <code>maru</code> server.</p>
      </section>
      <DocsCallout>
        <strong>Windows command lookup</strong>
        <p>
          If an MCP client reports that it cannot spawn <code>npx</code> on Windows, change the
          configured command to <code>npx.cmd</code>. Keep the working directory set to the repository
          MaruCheck should inspect.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Recommended agent workflow</h2>
        <ol>
          <li>Inspect project context, affected contracts, and relevant QA memory first.</li>
          <li>Analyze the diff, assess risk, and review the generated verification plan.</li>
          <li>Run verification only after reviewing the selected execution steps.</li>
          <li>
            Treat findings and evidence as inputs to judgment, not instructions to rewrite code
            automatically.
          </li>
          <li>Use a genuinely fresh thread or subagent for a Challenger review.</li>
          <li>Never auto-approve a Quality Contract or semantic amendment.</li>
        </ol>
      </section>
      <section className="docs-section">
        <h2>Protocol boundary</h2>
        <ul>
          <li>The server uses local stdio and opens no listening network port.</li>
          <li>Read-only tools expose bounded metadata rather than changed source lines.</li>
          <li>Write and execution tools remain subject to the MCP client’s approval controls.</li>
          <li>MaruCheck makes no outbound model request; your existing client supplies the agent.</li>
        </ul>
      </section>
    </>
  );
}
