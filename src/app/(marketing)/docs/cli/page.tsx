import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { MARUCHECK_CLI_SPEC, MARUCHECK_CLI_VERSION } from "@/lib/public-release";

export const metadata: Metadata = {
  title: "CLI reference",
  description: "Reference for the published MaruCheck CLI and its local verification commands.",
};

const commandGroups = [
  {
    commands: [
      ["maru init", "Create an idempotent .maru workspace and configuration."],
      ["maru scan", "Inventory routes, tests, dependencies, CI, and source structure."],
      [
        "maru doctor",
        "Check runtime, Git, package manager, configuration, and test prerequisites.",
      ],
    ],
    title: "Project setup",
  },
  {
    commands: [
      ["maru risk --diff", "Calculate an explainable 0–100 risk score for the current Git diff."],
      ["maru plan --diff", "Write the requirement-linked verification plan."],
      [
        "maru verify --diff",
        "Run selected checks and write evidence, findings, and the release gate.",
      ],
      ["maru mutate --diff --max 20", "Check whether selected tests reject isolated mutations."],
    ],
    title: "Change verification",
  },
  {
    commands: [
      [
        "maru drift check --from observations.json",
        "Compare observed behavior with protected intent.",
      ],
      ['maru memory search "authorization"', "Find relevant confirmed bugs and regression tests."],
      [
        "maru challenge prepare --diff",
        "Prepare a bounded brief for a fresh AI-client QA context.",
      ],
      ["maru ci init", "Install the least-privilege GitHub pull-request workflow."],
      ["maru mcp", "Start the local stdio MCP server."],
    ],
    title: "Guardrails and integrations",
  },
] as const;

export default function CliDocsPage() {
  return (
    <>
      <span className="docs-kicker">Published package · v{MARUCHECK_CLI_VERSION}</span>
      <h1>CLI reference</h1>
      <p className="docs-lead">
        The npm package is named <code>marucheck</code>. It installs the executable named
        <code>maru</code>, which keeps normal project commands short and consistent across local and
        CI environments.
      </p>
      <section className="docs-section">
        <h2>Install</h2>
        <CodeBlock>{`npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}\nnpx --no-install maru --help`}</CodeBlock>
        <p>
          Use an exact project dependency for repeatable team and CI execution. A global install is
          optional: <code>npm install --global {MARUCHECK_CLI_SPEC}</code>.
        </p>
      </section>
      <DocsCallout>
        <strong>Local-first means no silent downloads during verification.</strong>
        <p>
          MaruCheck runs repository-owned test and scanner tools that are already installed. A
          missing adapter remains unavailable or inconclusive; it is never presented as a pass.
        </p>
      </DocsCallout>
      {commandGroups.map((group) => (
        <section className="docs-section" key={group.title}>
          <h2>{group.title}</h2>
          <dl className="docs-command-list">
            {group.commands.map(([command, description]) => (
              <div key={command}>
                <dt>
                  <code>{command}</code>
                </dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <section className="docs-section">
        <h2>Quality Contract lifecycle</h2>
        <CodeBlock>{`maru contract create --from requirements.md\nmaru contract list\nmaru contract show <contract-id>\nmaru contract validate [path]\nmaru contract diff <current> <proposed>\nmaru contract approve <contract-id> --by <owner>`}</CodeBlock>
        <p>
          Creation always produces a draft. Approval is a separate accountable-owner action and
          writes an immutable, hash-addressed history snapshot.
        </p>
      </section>
      <section className="docs-section">
        <h2>Output and exit behavior</h2>
        <ul>
          <li>
            Generated plans and inventory are written under <code>.maru/generated/</code>.
          </li>
          <li>
            Run reports and raw execution artifacts are written under <code>.maru/artifacts/</code>.
          </li>
          <li>
            Confirmed QA memory is stored under <code>.maru/memory/</code>.
          </li>
          <li>A blocking verification or CI gate returns a non-zero exit code.</li>
          <li>
            Use <code>maru --version</code> to confirm the active package release.
          </li>
        </ul>
      </section>
    </>
  );
}
