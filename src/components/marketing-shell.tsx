import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";
import { Icon } from "@/components/icon";
import { MarketingGsap } from "@/components/marketing-gsap";
import { MaruMark } from "@/components/maru-mark";
import { MarketingMotion } from "@/components/marketing-motion";
import { MarketingNavigation } from "@/components/marketing-navigation";
import { fetchStarCount, formatStarCount } from "@/lib/github-stars";
import {
  MARUCHECK_CLI_SPEC,
  MARUCHECK_CONTRIBUTING_URL,
  MARUCHECK_LICENSE_URL,
  MARUCHECK_NPM_URL,
  MARUCHECK_RELEASES_URL,
  MARUCHECK_SOURCE_URL,
  MARUCHECK_WEB_SOURCE_URL,
} from "@/lib/public-release";

const INSTALL_COMMAND = `npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}`;

const footerColumns = [
  {
    title: "Product",
    links: [
      ["Overview", "/product"],
      ["How it works", "/#workflow"],
      ["Proof console", "/dashboard"],
      ["About", "/about"],
    ],
  },
  {
    title: "Documentation",
    links: [
      ["Getting started", "/docs/getting-started"],
      ["Quality Contracts", "/docs/quality-contracts"],
      ["CLI reference", "/docs/cli"],
      ["CI integration", "/docs/ci"],
    ],
  },
  {
    title: "Open source",
    links: [
      ["CLI repository", MARUCHECK_SOURCE_URL],
      ["Web repository", MARUCHECK_WEB_SOURCE_URL],
      ["Contributing guide", MARUCHECK_CONTRIBUTING_URL],
      ["Releases", MARUCHECK_RELEASES_URL],
      ["npm package", MARUCHECK_NPM_URL],
      ["MIT license", MARUCHECK_LICENSE_URL],
    ],
  },
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
              <a
                className="marketing-button marketing-button--ghost-dark footer-star"
                href={MARUCHECK_SOURCE_URL}
                rel="noreferrer"
                target="_blank"
              >
                <Icon fill="currentColor" name="github" stroke="none" />
                Star on GitHub
                {stars === null ? null : <b>{formatStarCount(stars)}</b>}
              </a>
            </div>
            <div className="footer-command">
              <span aria-hidden="true">$</span>
              <code>{INSTALL_COMMAND}</code>
              <CopyButton label="Copy" value={INSTALL_COMMAND} />
              <Link href="/docs/getting-started">Full setup →</Link>
            </div>
          </div>
          <div className="footer-proof__trace" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </section>
        <div className="marketing-container marketing-footer__columns">
          <div className="marketing-footer__brand">
            <MaruMark />
            <p>
              An independent verifier for AI-authored software. Read it, run it locally, change it —
              MIT licensed, end to end.
            </p>
            <a
              className="footer-source"
              href={MARUCHECK_SOURCE_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Icon fill="currentColor" name="github" stroke="none" />
              Kidus-M/MaruCheck
              {stars === null ? null : <b>{formatStarCount(stars)}</b>}
            </a>
          </div>
          {footerColumns.map((column) => (
            <nav aria-label={`${column.title} links`} key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map(([label, href]) => (
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
          <Link className="system-state" href="/api/health/live">
            <i /> System status
          </Link>
        </div>
      </footer>
    </div>
  );
}
