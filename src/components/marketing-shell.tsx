import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { MaruMark } from "@/components/maru-mark";
import { MarketingMotion } from "@/components/marketing-motion";
import { MarketingNavigation } from "@/components/marketing-navigation";

const footerGroups = [
  {
    title: "Product",
    links: [
      ["Overview", "/product"],
      ["Proof dashboard", "/dashboard"],
      ["Pricing", "/pricing"],
      ["Sign in", "/sign-in"],
    ],
  },
  {
    title: "Developers",
    links: [
      ["Documentation", "/docs"],
      ["Getting started", "/docs/getting-started"],
      ["Quality Contracts", "/docs/quality-contracts"],
      ["MCP integration", "/docs/mcp"],
      ["Production feedback", "/docs/production-feedback"],
    ],
  },
  {
    title: "System",
    links: [
      ["CI verification", "/docs/ci"],
      ["About", "/about"],
      ["Service health", "/api/health"],
      ["GitHub", "https://github.com/Kidus-M/MaruCheck"],
    ],
  },
] as const;

export function MarketingShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="marketing-site">
      <MarketingMotion />
      <MarketingNavigation />
      <main id="main-content">{children}</main>
      <footer className="marketing-footer">
        <section className="footer-proof">
          <div className="marketing-container footer-proof__inner" data-reveal>
            <p className="signal-label">
              <span /> Final verification
            </p>
            <h2>
              The coding agent builds.
              <span>MaruCheck proves.</span>
            </h2>
            <div className="footer-proof__actions">
              <Link className="marketing-button marketing-button--signal" href="/sign-in">
                Start with MaruCheck <Icon name="arrow" />
              </Link>
              <Link className="marketing-button marketing-button--ghost-dark" href="/docs">
                Read the system docs
              </Link>
            </div>
          </div>
          <div className="footer-proof__trace" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </section>
        <div className="marketing-container marketing-footer__grid">
          <div className="marketing-footer__brand">
            <MaruMark />
            <p>Independent verification for software built at AI speed.</p>
            <span className="system-state">
              <i /> Local-first core operational
            </span>
          </div>
          {footerGroups.map((group) => (
            <nav aria-label={`${group.title} links`} key={group.title}>
              <strong>{group.title}</strong>
              {group.links.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="marketing-container marketing-footer__bottom">
          <span>© {new Date().getFullYear()} MaruCheck</span>
          <span>Intent → risk → verification → evidence</span>
          <span>Built for the failure path.</span>
        </div>
      </footer>
    </div>
  );
}
