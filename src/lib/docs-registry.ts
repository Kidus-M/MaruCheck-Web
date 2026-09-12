import type { Metadata } from "next";
import type { FaqItem } from "@/lib/structured-data";
import {
  CI_FAQ,
  CONTRACTS_FAQ,
  GETTING_STARTED_FAQ,
  MCP_FAQ,
} from "@/lib/faq-content";
import { buildPageMetadata } from "@/lib/seo";

/**
 * One record per public documentation page.
 *
 * `updated` is a freshness signal that answer engines weigh when choosing
 * between competing sources, and it is published as `dateModified` in the
 * page's TechArticle markup. Bump it whenever the page's content meaningfully
 * changes — a stale date costs more visibility than a missing one.
 */
type DocEntry = {
  readonly description: string;
  readonly faq?: readonly FaqItem[];
  readonly keywords?: readonly string[];
  readonly title: string;
  readonly updated: string;
};

export const DOCS_PAGES = {
  "": {
    description:
      "Every MaruCheck guide in reading order: install the CLI, write Quality Contracts, run a risk-targeted verification, connect an MCP client, gate CI, and feed production failures back into QA Memory.",
    keywords: ["MaruCheck documentation", "MaruCheck guides"],
    title: "Documentation",
    updated: "2026-08-28",
  },
  "agent-gate": {
    description:
      "Register MaruCheck verification as a Claude Code Stop hook so a coding agent cannot end a turn while the release gate is blocked.",
    keywords: ["Claude Code Stop hook", "agent guardrail", "AI approval boundary"],
    title: "Agent gate",
    updated: "2026-08-28",
  },
  ci: {
    description:
      "Install MaruCheck's least-privilege GitHub Actions pull-request workflow so every change is verified in CI and the run's evidence is retained even when the gate blocks.",
    faq: CI_FAQ,
    keywords: ["GitHub Actions", "CI release gate", "pull request verification"],
    title: "CI integration",
    updated: "2026-08-21",
  },
  cli: {
    description:
      "Every MaruCheck command in one reference: contracts, risk scoring, verification plans, drift checks, QA Memory search, mutation testing, Git hooks, CI setup, and the MCP server.",
    keywords: ["maru verify", "maru risk", "maru contract", "CLI commands"],
    title: "CLI reference",
    updated: "2026-08-28",
  },
  "getting-started": {
    description:
      "Install the MaruCheck CLI and produce your first inspectable local release decision in about five minutes, before connecting a dashboard, an AI client, or CI.",
    faq: GETTING_STARTED_FAQ,
    keywords: ["install MaruCheck", "MaruCheck tutorial", "first verification run"],
    title: "Getting started",
    updated: "2026-08-23",
  },
  mcp: {
    description:
      "Connect MaruCheck's local stdio MCP server to Codex, Claude Code, Cursor, or any compatible client so an agent can inspect contracts, assess risk, and run verification without approving its own work.",
    faq: MCP_FAQ,
    keywords: ["MCP server", "Model Context Protocol", "Claude Code", "Cursor", "Codex"],
    title: "MCP workflow",
    updated: "2026-08-23",
  },
  "production-feedback": {
    description:
      "Send bounded production failures into MaruCheck's reviewed QA-memory workflow without uploading source or letting telemetry silently rewrite product intent.",
    keywords: ["production telemetry", "regression memory", "incident feedback loop"],
    title: "Production feedback",
    updated: "2026-08-23",
  },
  "qa-memory": {
    description:
      "How MaruCheck stores confirmed failures, matches them to changed code, and forces the matching regression test back into the verification plan so a bug can only surprise you once.",
    keywords: ["QA memory", "regression recall", "repeat bug prevention"],
    title: "QA Memory",
    updated: "2026-09-12",
  },
  "quality-contracts": {
    description:
      "Write durable, executable Quality Contracts that record approved product behavior, protected invariants, accountable owners, and which requirement IDs block a release.",
    faq: CONTRACTS_FAQ,
    keywords: ["quality contract", "requirement ID", "evidence policy", "behavior contract"],
    title: "Quality Contracts",
    updated: "2026-08-21",
  },
  "report-ingestion": {
    description:
      "Connect a project and send completed MaruCheck proof metadata to the hosted dashboard using a scoped project token you issue and can revoke.",
    keywords: ["report ingestion", "project token", "proof console"],
    title: "Hosted verification reports",
    updated: "2026-08-21",
  },
} as const satisfies Record<string, DocEntry>;

export type DocSlug = keyof typeof DOCS_PAGES;

export function docsPath(slug: DocSlug): string {
  return slug === "" ? "/docs" : `/docs/${slug}`;
}

export function docsMetadata(slug: DocSlug): Metadata {
  const entry = DOCS_PAGES[slug];

  return buildPageMetadata({
    description: entry.description,
    keywords: "keywords" in entry ? entry.keywords : [],
    path: docsPath(slug),
    title: entry.title,
    type: "article",
    updated: entry.updated,
  });
}
