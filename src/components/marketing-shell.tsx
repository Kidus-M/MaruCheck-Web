import Link from "next/link";
import type { ReactNode } from "react";
import { MaruMark } from "@/components/maru-mark";
import { MarketingMotion } from "@/components/marketing-motion";

const links = [
  { href: "/product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
] as const;

export function MarketingShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="marketing-site">
      <MarketingMotion />
      <header className="marketing-header">
        <div className="marketing-container marketing-header__inner">
          <MaruMark />
          <nav className="marketing-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="marketing-header__actions">
            <Link className="text-link" href="/sign-in">
              Sign in
            </Link>
            <Link className="button button--ink button--small" href="/dashboard">
              Explore dashboard
            </Link>
          </div>
          <details className="marketing-menu">
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              {links.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link href="/sign-in">Sign in</Link>
              <Link href="/dashboard">Explore dashboard</Link>
            </nav>
          </details>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="marketing-footer">
        <div className="marketing-container marketing-footer__grid">
          <div className="marketing-footer__brand">
            <MaruMark />
            <p>Independent release proof for software built at AI speed.</p>
            <span>Intent → challenge → evidence → release.</span>
          </div>
          <div>
            <strong>Product</strong>
            <Link href="/product">Overview</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/dashboard">Live dashboard</Link>
          </div>
          <div>
            <strong>Learn</strong>
            <Link href="/docs">Documentation</Link>
            <Link href="/docs/getting-started">Getting started</Link>
            <Link href="/docs/quality-contracts">Quality Contracts</Link>
          </div>
          <div>
            <strong>Company</strong>
            <Link href="/about">About</Link>
            <Link href="/docs/ci">CI integration</Link>
            <Link href="/docs/mcp">MCP workflow</Link>
          </div>
        </div>
        <div className="marketing-container marketing-footer__bottom">
          <span>© {new Date().getFullYear()} MaruCheck</span>
          <span>Built around proof, not promises.</span>
        </div>
      </footer>
    </div>
  );
}
