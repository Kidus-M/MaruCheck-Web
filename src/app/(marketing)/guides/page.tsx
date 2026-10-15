import Link from "next/link";
import { DocsCallout } from "@/components/docs-shell";
import { JsonLd } from "@/components/json-ld";
import { GUIDE_SLUGS, GUIDES, GUIDES_HUB, guidePath } from "@/lib/guides-registry";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  description: GUIDES_HUB.description,
  keywords: ["AI coding guides", "testing AI code", "AI code verification guide"],
  path: "/guides",
  title: GUIDES_HUB.title,
});

export default function GuidesHubPage() {
  return (
    <>
      <span className="docs-kicker">Guides</span>
      <h1 className="guide-title">Testing and verifying AI-written code</h1>
      <p className="docs-lead">
        AI coding agents write code faster than anyone can review it line by line, and they can
        change the tests that judge their own work. These guides cover the practical side: how to
        verify an AI-generated change, how to catch an agent that edited its tests, how to review AI
        pull requests, and how to prove a test suite actually catches bugs. Most of the advice works
        with any tool.
      </p>

      <nav aria-label="All guides" className="docs-index">
        {GUIDE_SLUGS.map((slug, index) => (
          <Link href={guidePath(slug)} key={slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{GUIDES[slug].heading}</h2>
            <p>{GUIDES[slug].description}</p>
            <b>{GUIDES[slug].readingMinutes} min →</b>
          </Link>
        ))}
      </nav>

      <DocsCallout>
        <strong>Looking for the MaruCheck manual?</strong>
        <p>
          The guides explain the problem and the general fix. The{" "}
          <Link href="/docs">documentation</Link> covers MaruCheck itself: installing the CLI,
          writing Quality Contracts, CI, and the MCP server.
        </p>
      </DocsCallout>

      <JsonLd
        nodes={[
          {
            "@type": "CollectionPage",
            description: GUIDES_HUB.description,
            hasPart: GUIDE_SLUGS.map((slug) => ({
              "@type": "TechArticle",
              headline: GUIDES[slug].title,
              url: absoluteUrl(guidePath(slug)),
            })),
            name: GUIDES_HUB.title,
            url: absoluteUrl("/guides"),
          },
          breadcrumbSchema([
            { name: "MaruCheck", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />
    </>
  );
}
