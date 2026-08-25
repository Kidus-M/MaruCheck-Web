import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { MarketingGsap } from "@/components/marketing-gsap";
import { MaruMark } from "@/components/maru-mark";
import { MarketingMotion } from "@/components/marketing-motion";
import { MarketingNavigation } from "@/components/marketing-navigation";
import { fetchStarCount } from "@/lib/github-stars";
import {
  MARUCHECK_CLI_SPEC,
  MARUCHECK_CONTRIBUTING_URL,
  MARUCHECK_LICENSE_URL,
  MARUCHECK_RELEASES_URL,
  MARUCHECK_SOURCE_URL,
} from "@/lib/public-release";

const footerLinks = [
  ["Product", "/product"],
  ["How it works", "/#workflow"],
  ["Documentation", "/docs"],
  ["Open source", "/open-source"],
  ["About", "/about"],
  ["Source", MARUCHECK_SOURCE_URL],
  ["Contribute", MARUCHECK_CONTRIBUTING_URL],
  ["Releases", MARUCHECK_RELEASES_URL],
  ["MIT license", MARUCHECK_LICENSE_URL],
  ["System status", "/api/health/live"],
  ["Sign in", "/sign-in"],
] as const;

export async function MarketingShell({ children }: { readonly children: ReactNode }) {
  const stars = await fetchStarCount();

  return (
    <div className="marketing-site">
      <MarketingMotion />
      <MarketingGsap />
      <MarketingNavigation stars={stars} />
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
              <Link
                className="marketing-button marketing-button--ghost-dark"
                href={MARUCHECK_CONTRIBUTING_URL}
              >
                Contribute on GitHub
              </Link>
            </div>
            <div className="footer-command">
              <span>$</span>
              <code>npm install --save-dev --save-exact {MARUCHECK_CLI_SPEC}</code>
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
            <i /> Open source · MIT licensed
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
