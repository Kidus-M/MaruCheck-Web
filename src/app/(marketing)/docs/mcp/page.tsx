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
      <DocsCallout>
        <strong>Bring the agent you already use.</strong>
        <p>
          MaruCheck does not supply a hosted agent or make its own model request. MCP connects the
          local verifier to Codex, Claude Code, Cursor, or another compatible client. Your existing
          client supplies the reasoning; MaruCheck supplies bounded context, deterministic checks,
          and evidence-backed gates.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>When MCP is required</h2>
        <ul>
          <li>
            MCP is <strong>not required</strong> to run the MaruCheck CLI yourself.
          </li>
          <li>
            Connect MCP when you want your coding agent to call MaruCheck tools directly and read
            structured results.
          </li>
          <li>
            A Challenger review can also be handed to a fresh thread manually, but MCP-capable
            clients can coordinate the preparation and submission steps.
          </li>
        </ul>
      </section>
      <section className="docs-section">
        <h2>Choose a package strategy</h2>
        <p>
          For a quick trial, let the MCP client start the exact npm release with <code>npx</code>.
          For a team, install <code>{MARUCHECK_CLI_SPEC}</code> in the project and replace the
          arguments with <code>[&quot;--no-install&quot;, &quot;maru&quot;, &quot;mcp&quot;]</code>.
        </p>
      </section>
      <section className="docs-section">
        <h2>Codex</h2>
        <p>
          Add this to the trusted project’s <code>.codex/config.toml</code>:
        </p>
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
        <p>
          Add <code>.cursor/mcp.json</code> to the target repository:
        </p>
        <CodeBlock label="JSON">{`{
  "mcpServers": {
    "maru": {
      "command": "npx",
      "args": ["--yes", "${MARUCHECK_CLI_SPEC}", "mcp"]
    }
  }
}`}</CodeBlock>
        <p>
          Restart Cursor, open MCP settings, and enable the <code>maru</code> server.
        </p>
      </section>
      <DocsCallout>
        <strong>Windows command lookup</strong>
        <p>
          If an MCP client reports that it cannot spawn <code>npx</code> on Windows, change the
          configured command to <code>npx.cmd</code>. Keep the working directory set to the
          repository MaruCheck should inspect.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Normal agent workflow</h2>
        <ol>
          <li>Inspect project context, affected contracts, and relevant QA memory first.</li>
          <li>Analyze the diff, assess risk, and review the generated verification plan.</li>
          <li>Run verification only after reviewing the selected execution steps.</li>
          <li>
            Treat findings and evidence as inputs to judgment, not instructions to rewrite code
            automatically.
          </li>
          <li>Never auto-approve a Quality Contract or semantic amendment.</li>
        </ol>
      </section>
      <section className="docs-section">
        <h2>Isolated Challenger workflow</h2>
        <p>
          Use this second-opinion workflow for high-risk or release changes. The Challenger receives
          a bounded, source-free brief rather than the builder conversation.
        </p>
        <ol className="docs-steps">
          <li>
            <b>Prepare</b>
            <span>
              Call <code>maru_prepare_challenge</code> from the connected MCP client.
            </span>
          </li>
          <li>
            <b>Isolate</b>
            <span>Give only the returned brief to a genuinely fresh thread or subagent.</span>
          </li>
          <li>
            <b>Challenge</b>
            <span>The isolated agent returns JSON matching the brief&apos;s response schema.</span>
          </li>
          <li>
            <b>Submit</b>
            <span>
              Call <code>maru_submit_challenge</code> with the response and truthful provenance.
            </span>
          </li>
          <li>
            <b>Verify</b>
            <span>
              Treat the returned scenarios as hypotheses until tests or manual evidence confirm
              them.
            </span>
          </li>
        </ol>
        <DocsCallout>
          <strong>No subagent support?</strong>
          <p>
            Open a new conversation manually, provide only the generated brief, save its structured
            response, and submit it with the CLI commands below.
          </p>
        </DocsCallout>
        <CodeBlock>{`npx --no-install maru challenge prepare --diff --release
# Give the generated brief.json to a fresh QA conversation.
npx --no-install maru challenge submit --brief .maru/artifacts/challenges/<challenge-id>/brief.json --from challenge-response.json`}</CodeBlock>
        <p>
          MaruCheck records the declared isolation method, but an MCP server cannot inspect or prove
          the host client&apos;s conversation boundary. A passed Challenger gate confirms the review
          protocol completed; it does not prove every hypothesis is a real defect.
        </p>
      </section>
      <section className="docs-section">
        <h2>Protocol boundary</h2>
        <ul>
          <li>The server uses local stdio and opens no listening network port.</li>
          <li>Read-only tools expose bounded metadata rather than changed source lines.</li>
          <li>Write and execution tools remain subject to the MCP client’s approval controls.</li>
          <li>
            MaruCheck makes no outbound model request; your existing client supplies the agent.
          </li>
        </ul>
      </section>
    </>
  );
}
