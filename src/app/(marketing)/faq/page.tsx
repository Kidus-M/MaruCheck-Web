import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { MarketingCta } from "@/components/marketing-ui";
import {
  CI_FAQ,
  CONTRACTS_FAQ,
  GETTING_STARTED_FAQ,
  HOME_FAQ,
  MCP_FAQ,
  OPEN_SOURCE_FAQ,
  PRODUCT_FAQ,
  ALL_FAQ,
} from "@/lib/faq-content";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  description:
    "Direct answers about MaruCheck: what it is, why a green test suite is not enough for AI-generated code, what a Quality Contract is, whether source code leaves your machine, how to connect Codex or Claude Code, and what it costs.",
  keywords: ["MaruCheck FAQ", "how does MaruCheck work", "MaruCheck questions"],
  path: "/faq",
  title: "FAQ",
});

/**
 * Grouped view of the same answers the rest of the site shows. Answer engines
 * favour a single page that resolves a whole cluster of related questions, so
 * the site's full question set is gathered here as well as being shown in
 * context on the pages it belongs to.
 */
const groups = [
  { heading: "MaruCheck basics", id: "basics", items: HOME_FAQ },
  { heading: "How verification works", id: "verification", items: PRODUCT_FAQ },
  { heading: "Installing and running", id: "install", items: GETTING_STARTED_FAQ },
  { heading: "Quality Contracts", id: "contracts", items: CONTRACTS_FAQ },
  { heading: "AI agents and MCP", id: "agents", items: MCP_FAQ },
  { heading: "Continuous integration", id: "ci", items: CI_FAQ },
  { heading: "Licensing and source", id: "open-source", items: OPEN_SOURCE_FAQ },
] as const;

export default function FaqPage() {
  return (
    <>
      <section className="faq-hero" data-gsap-hero>
        <div className="marketing-container">
          <p className="v2-kicker">
            <span>FAQ / DIRECT ANSWERS</span> Everything in one place
          </p>
          <h1>
            <span className="hero-word-clip">
              <span className="hero-word">Questions about</span>
            </span>
            <span className="hero-word-clip hero-word-clip--offset">
              <span className="hero-word">
                <em>MaruCheck.</em>
              </span>
            </span>
          </h1>
          <p className="faq-hero__lead">
            Short, complete answers about what MaruCheck verifies, where it runs, what it costs, and
            how it fits alongside the coding agent you already use.
          </p>
          <nav aria-label="Question categories" className="faq-jump">
            {groups.map((group) => (
              <a href={`#${group.id}`} key={group.id}>
                {group.heading}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {groups.map((group) => (
        <section
          aria-labelledby={`${group.id}-heading`}
          className="aeo-faq aeo-faq--page"
          id={group.id}
          key={group.id}
        >
          <div className="marketing-container aeo-faq__inner">
            <div className="aeo-faq__heading">
              <h2 id={`${group.id}-heading`}>{group.heading}</h2>
            </div>
            <dl className="aeo-faq__list">
              {group.items.map((item) => (
                <div className="aeo-faq__item" key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ))}

      <section className="faq-outro">
        <div className="marketing-container" data-gsap>
          <h2>Still deciding?</h2>
          <p>
            The fastest answer is a real one. Verify one change in a repository you already use, or
            read the verifier&apos;s source before you trust it in a release path.
          </p>
          <div className="marketing-actions">
            <MarketingCta href="/docs/getting-started">Verify your first change</MarketingCta>
            <MarketingCta href="/open-source" secondary>
              Read the source
            </MarketingCta>
          </div>
          <p className="faq-outro__machine">
            Reading this as an agent? <Link href="/llms.txt">/llms.txt</Link> and{" "}
            <Link href="/pricing.md">/pricing.md</Link> carry the same facts in plain text.
          </p>
        </div>
      </section>

      <JsonLd
        nodes={[
          faqSchema(ALL_FAQ),
          {
            "@type": "WebPage",
            description: metadata.description,
            name: "MaruCheck FAQ",
            url: absoluteUrl("/faq"),
          },
          breadcrumbSchema([
            { name: "MaruCheck", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
    </>
  );
}
