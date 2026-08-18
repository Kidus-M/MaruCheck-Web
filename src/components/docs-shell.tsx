import Link from "next/link";
import type { ReactNode } from "react";

const docsLinks = [
  { href: "/docs", label: "Documentation home" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/quality-contracts", label: "Quality Contracts" },
  { href: "/docs/ci", label: "CI integration" },
  { href: "/docs/mcp", label: "MCP workflow" },
] as const;

export function DocsShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="marketing-container docs-shell">
      <aside className="docs-sidebar">
        <span>Documentation</span>
        <nav aria-label="Documentation navigation">
          {docsLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <div className="docs-sidebar__help">
          <strong>See the system at work</strong>
          <p>Explore the seeded release proof in the dashboard.</p>
          <Link href="/dashboard">Open dashboard →</Link>
        </div>
      </aside>
      <article className="docs-article" data-reveal>{children}</article>
    </div>
  );
}

export function CodeBlock({ children }: { readonly children: ReactNode }) {
  return <pre className="docs-code"><code>{children}</code></pre>;
}

export function DocsCallout({ children }: { readonly children: ReactNode }) {
  return <aside className="docs-callout">{children}</aside>;
}
