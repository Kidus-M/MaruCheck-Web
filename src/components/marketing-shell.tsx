import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { MarketingGsap } from "@/components/marketing-gsap";
import { MaruMark } from "@/components/maru-mark";
import { MarketingMotion } from "@/components/marketing-motion";
import { MarketingNavigation } from "@/components/marketing-navigation";

const footerLinks = [
  ["Product", "/product"],
  ["How it works", "/#workflow"],
  ["Documentation", "/docs"],
  ["About", "/about"],
  ["GitHub", "https://github.com/Kidus-M/MaruCheck"],
  ["System status", "/api/health/live"],
  ["Sign in", "/sign-in"],
] as const;

export function MarketingShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="marketing-site">
      <MarketingMotion />
      <MarketingGsap />
      <MarketingNavigation />
      <main id="main-content">{children}</main>
      <footer className="marketing-footer">
        <section className="footer-proof">
          <div className="marketing-container footer-proof__inner" data-reveal>
            <p className="signal-label">
              <span /> The independent check
            </p>
            <h2>
              The coding agent builds.
              <span>MaruCheck proves.</span>
            </h2>
            <p className="footer-proof__copy">
              Give your next AI-authored change a contract, a memory, and a release decision you can
              inspect.
            </p>
            <div className="footer-proof__actions">
              <Link
                className="marketing-button marketing-button--signal"
                href="/docs/getting-started"
              >
                Verify your first change <Icon name="arrow" />
              </Link>
              <Link className="marketing-button marketing-button--ghost-dark" href="/dashboard">
                Inspect the proof console
              </Link>
            </div>
            <div className="footer-command">
              <span>$</span>
              <code>npm install --save-dev --save-exact marucheck@0.2.2</code>
              <Link href="/docs/getting-started">Copy the full setup →</Link>
            </div>
          </div>
          <div className="footer-proof__trace" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </section>
        <div className="marketing-container marketing-footer__rail">
          <div className="marketing-footer__brand">
            <MaruMark />
          </div>
          <nav aria-label="Footer navigation">
            {footerLinks.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <span className="system-state">
            <i /> Local-first core operational
          </span>
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
