import type { Metadata } from "next";
import Link from "next/link";
import { DocsCallout } from "@/components/docs-shell";
import {
  MARUCHECK_CLI_VERSION,
  MARUCHECK_CONTRIBUTING_URL,
  MARUCHECK_NPM_URL,
} from "@/lib/public-release";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn the MaruCheck contract, verification, CI, and MCP workflows.",
};

const entries = [
  [
    "01",
    "Getting started",
    "Install the published CLI, initialize a repository, and produce the first local verification report.",
    "/docs/getting-started",
  ],
  [
    "02",
    "CLI reference",
    "Find every local command for contracts, risk, planning, verification, drift, memory, mutation, CI, and MCP.",
    "/docs/cli",
  ],
  [
    "03",
    "Quality Contracts",
    "Record durable behavior, protected invariants, ownership, and evidence policy in a reviewed contract.",
    "/docs/quality-contracts",
  ],
  [
    "04",
    "CI integration",
    "Install the least-privilege pull-request workflow and retain evidence even when the gate blocks.",
    "/docs/ci",
  ],
  [
    "05",
    "MCP workflow",
    "Connect the coding agent you already use, then run local verification and isolated Challenger review without another model provider.",
    "/docs/mcp",
  ],
  [
    "06",
    "Hosted reports",
    "Connect a dashboard project and explicitly send completed proof metadata without uploading source code.",
    "/docs/report-ingestion",
  ],
  [
    "07",
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
      <DocsCallout>
        <strong>MaruCheck CLI v{MARUCHECK_CLI_VERSION} is open source under MIT.</strong>
        <p>
          Install it from <a href={MARUCHECK_NPM_URL}>npm</a>. Core verification is local-first and
          does not require a MaruCheck account; the hosted dashboard is an optional proof-sharing
          layer. Read the source or <a href={MARUCHECK_CONTRIBUTING_URL}>contribute on GitHub</a>.
        </p>
      </DocsCallout>
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
