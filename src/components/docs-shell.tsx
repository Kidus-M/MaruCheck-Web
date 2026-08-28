import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";
import { MARUCHECK_CLI_VERSION } from "@/lib/public-release";

const docsLinks = [
  { href: "/docs", label: "Documentation home" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/cli", label: "CLI reference" },
  { href: "/docs/quality-contracts", label: "Quality Contracts" },
  { href: "/docs/ci", label: "CI integration" },
  { href: "/docs/mcp", label: "MCP workflow" },
  { href: "/docs/agent-gate", label: "Agent gate" },
  { href: "/docs/report-ingestion", label: "Hosted reports" },
  { href: "/docs/production-feedback", label: "Production feedback" },
] as const;

export function DocsShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="marketing-container docs-shell">
      <aside className="docs-sidebar">
        <span>Documentation</span>
        <nav aria-label="Documentation navigation">
          {docsLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="docs-sidebar__help">
          <strong>CLI v{MARUCHECK_CLI_VERSION} is live</strong>
          <p>Install the public npm package and run your first local verification.</p>
          <Link href="/docs/getting-started">Start in five minutes →</Link>
        </div>
      </aside>
      <article className="docs-article" data-reveal>
        {children}
      </article>
    </div>
  );
}

export function CodeBlock({
  children,
  label = "Terminal",
}: {
  readonly children: string;
  readonly label?: string;
}) {
  return (
    <div className="docs-code-shell">
      <div className="docs-code-toolbar">
        <span>{label}</span>
        <CopyButton label={`Copy ${label.toLowerCase()}`} value={children} />
      </div>
      <pre className="docs-code">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function DocsCallout({ children }: { readonly children: ReactNode }) {
  return <aside className="docs-callout">{children}</aside>;
}
