import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing-ui";
import {
  MARUCHECK_CLI_SPEC,
  MARUCHECK_CONTRIBUTING_URL,
  MARUCHECK_LICENSE_URL,
  MARUCHECK_NPM_URL,
  MARUCHECK_RELEASES_URL,
  MARUCHECK_SOURCE_URL,
  MARUCHECK_WEB_SOURCE_URL,
} from "@/lib/public-release";

export const metadata: Metadata = {
  title: "Open source",
  description:
    "Inspect, run, and contribute to MaruCheck—the MIT-licensed verifier for AI-authored software.",
};

const repositories = [
  {
    index: "01",
    name: "MaruCheck CLI",
    href: MARUCHECK_SOURCE_URL,
    role: "The local verifier",
    detail:
      "Quality Contracts, risk analysis, verification plans, evidence, QA Memory, semantic drift, MCP, and CI.",
  },
  {
    index: "02",
    name: "MaruCheck Web",
    href: MARUCHECK_WEB_SOURCE_URL,
    role: "The shared proof console",
    detail:
      "The public site, authenticated dashboard, project connections, report ingestion, and production feedback.",
  },
] as const;

export default function OpenSourcePage() {
  return (
    <>
      <section className="oss-hero" data-gsap-hero>
        <div className="oss-hero__grid" aria-hidden="true" />
        <div className="marketing-container oss-hero__inner">
          <p className="v2-kicker">
            <span>OPEN SOURCE / MIT</span> Trust starts with inspection
          </p>
          <h1>
            The verifier
            <br />
            is <em>open.</em>
          </h1>
          <div className="oss-hero__foot">
            <p>
              MaruCheck judges whether code has enough evidence to ship. You should be able to read
              how that judgment is made, run it locally, and change it with the community.
            </p>
            <div className="marketing-actions">
              <MarketingCta href={MARUCHECK_SOURCE_URL}>View source</MarketingCta>
              <MarketingCta href={MARUCHECK_CONTRIBUTING_URL} secondary>
                Contribute
              </MarketingCta>
            </div>
          </div>
        </div>
      </section>

      <section className="oss-install">
        <div className="marketing-container oss-install__grid">
          <div data-gsap>
            <p className="section-index">01 — RUN THE SAME VERIFIER</p>
            <h2>No black-box gate between your code and release.</h2>
          </div>
          <div className="oss-install__terminal" data-gsap>
            <header>
              <span>LOCAL / YOUR REPOSITORY</span>
              <b>MIT LICENSED</b>
            </header>
            <code>
              <i>$</i> npm install --save-dev --save-exact {MARUCHECK_CLI_SPEC}
            </code>
            <code>
              <i>$</i> npx --no-install maru verify --diff
            </code>
            <footer>
              <a href={MARUCHECK_NPM_URL}>npm package ↗</a>
              <a href={MARUCHECK_RELEASES_URL}>release notes ↗</a>
              <a href={MARUCHECK_LICENSE_URL}>MIT license ↗</a>
            </footer>
          </div>
        </div>
      </section>

      <section className="oss-repositories">
        <div className="marketing-container">
          <div className="oss-repositories__heading" data-gsap>
            <p className="section-index">02 — TWO REPOSITORIES / ONE PROOF LOOP</p>
            <h2>Separate release cycles. Shared contracts.</h2>
            <p>
              The local CLI and hosted application remain independent projects so either can evolve
              without hiding the boundary between local execution and shared evidence.
            </p>
          </div>
          <div className="oss-repository-list">
            {repositories.map((repository) => (
              <Link href={repository.href} key={repository.name} data-gsap>
                <span>{repository.index}</span>
                <div>
                  <small>{repository.role}</small>
                  <h3>{repository.name}</h3>
                  <p>{repository.detail}</p>
                </div>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="oss-contribute">
        <div className="marketing-container oss-contribute__grid">
          <p className="section-index">03 — CONTRIBUTE TO THE FAILURE PATH</p>
          <div data-gsap>
            <h2>Bring the case the happy path missed.</h2>
            <p>
              Report a false pass. Tighten a contract rule. Add an adapter. Improve the evidence a
              developer sees when a release is blocked. Focused issues and pull requests are
              welcome.
            </p>
            <div className="marketing-actions">
              <MarketingCta href={MARUCHECK_CONTRIBUTING_URL}>Read contributing guide</MarketingCta>
              <MarketingCta href={`${MARUCHECK_SOURCE_URL}/issues`} secondary>
                Open an issue
              </MarketingCta>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
