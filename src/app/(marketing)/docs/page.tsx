import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn the MaruCheck contract, verification, CI, and MCP workflows.",
};

const entries = [
  [
    "01",
    "Getting started",
    "Build the current CLI, initialize a repository, and produce the first local verification report.",
    "/docs/getting-started",
  ],
  [
    "02",
    "Quality Contracts",
    "Record durable behavior, protected invariants, ownership, and evidence policy in a reviewed contract.",
    "/docs/quality-contracts",
  ],
  [
    "03",
    "CI integration",
    "Install the least-privilege pull-request workflow and retain evidence even when the gate blocks.",
    "/docs/ci",
  ],
  [
    "04",
    "MCP workflow",
    "Connect Codex, Claude Code, Cursor, or another compatible client to the local MaruCheck server.",
    "/docs/mcp",
  ],
  [
    "05",
    "Production feedback",
    "Turn bounded production failures into commit-linked, human-reviewed QA memory candidates.",
    "/docs/production-feedback",
  ],
] as const;

export default function DocsHomePage() {
  return (
    <>
      <span className="docs-kicker">MaruCheck documentation</span>
      <h1>Build a release proof loop.</h1>
      <p className="docs-lead">
        Start with product intent. End with a release decision that links back to concrete evidence.
      </p>
      <nav className="docs-index" aria-label="Documentation topics">
        {entries.map(([number, title, description, href]) => (
          <Link href={href} key={href}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </nav>
      <section className="docs-section">
        <h2>The model in one minute</h2>
        <ol className="docs-steps">
          <li>
            <b>Contract</b>
            <span>records approved behavior</span>
          </li>
          <li>
            <b>Diff</b>
            <span>identifies affected risk</span>
          </li>
          <li>
            <b>Plan</b>
            <span>selects requirements and checks</span>
          </li>
          <li>
            <b>Evidence</b>
            <span>supports or blocks the release</span>
          </li>
        </ol>
      </section>
    </>
  );
}
