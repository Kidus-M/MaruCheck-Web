import Link from "next/link";
import type { ReactNode } from "react";
import { DocsFaq } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import type { GuideSlug } from "@/lib/guides-registry";
import { GUIDE_SLUGS, GUIDES, guidePath } from "@/lib/guides-registry";
import { AUTHOR_NAME } from "@/lib/seo";
import type { JsonLdNode } from "@/lib/structured-data";
import { breadcrumbSchema, faqSchema, techArticleSchema } from "@/lib/structured-data";

/** Same two-column frame as the docs, so guides inherit their typography. */
export function GuidesShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="marketing-container docs-shell guides-shell">
      <aside className="docs-sidebar">
        <span>Guides</span>
        <nav aria-label="Guides navigation">
          <Link href="/guides">All guides</Link>
          {GUIDE_SLUGS.map((slug) => (
            <Link href={guidePath(slug)} key={slug}>
              {GUIDES[slug].navLabel}
            </Link>
          ))}
        </nav>
        <div className="docs-sidebar__help">
          <strong>Try it on a real change</strong>
          <p>MaruCheck is a free, MIT-licensed CLI that verifies AI-written diffs locally.</p>
          <Link href="/docs/getting-started">Start in five minutes →</Link>
        </div>
      </aside>
      <article className="docs-article guide-prose" data-reveal>
        {children}
      </article>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}

/**
 * Kicker, H1, and a visible byline. The author and date are shown on the page,
 * not only in markup: both answer engines and readers weigh who wrote a guide
 * and how recently it was checked.
 */
export function GuideHeader({
  kicker = "Guide",
  slug,
}: {
  readonly kicker?: string;
  readonly slug: GuideSlug;
}) {
  const entry = GUIDES[slug];

  return (
    <>
      <span className="docs-kicker">{kicker}</span>
      <h1 className="guide-title">{entry.heading}</h1>
      <p className="guide-byline">
        By <Link href="/about">{AUTHOR_NAME}</Link>
        <span aria-hidden="true">·</span>
        Updated <time dateTime={entry.updated}>{formatDate(entry.updated)}</time>
        <span aria-hidden="true">·</span>
        {entry.readingMinutes} min read
      </p>
    </>
  );
}

/** A short, self-contained answer placed directly under the H1. */
export function GuideAnswer({ children }: { readonly children: ReactNode }) {
  return (
    <div className="guide-answer">
      <span>Short answer</span>
      <p>{children}</p>
    </div>
  );
}

export function GuideTable({
  caption,
  children,
}: {
  readonly caption: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="guide-table-wrap">
      <table className="guide-table">
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

/**
 * Closes a guide: FAQ block, related guides, and the Article, Breadcrumb, and
 * FAQPage markup built from the same registry entry the page renders.
 */
export function GuideFooter({
  extraNodes = [],
  related,
  slug,
}: {
  readonly extraNodes?: readonly JsonLdNode[];
  readonly related: readonly GuideSlug[];
  readonly slug: GuideSlug;
}) {
  const entry = GUIDES[slug];
  const path = guidePath(slug);

  const nodes: JsonLdNode[] = [
    techArticleSchema({
      description: entry.description,
      path,
      published: entry.published,
      title: entry.title,
      updated: entry.updated,
    }),
    breadcrumbSchema([
      { name: "MaruCheck", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: entry.title, path },
    ]),
    faqSchema(entry.faq),
    ...extraNodes,
  ];

  return (
    <>
      <DocsFaq items={entry.faq} />
      <section aria-labelledby="related-guides-heading" className="docs-section">
        <h2 id="related-guides-heading">Related guides</h2>
        <div className="docs-card-grid">
          {related.map((relatedSlug) => (
            <Link href={guidePath(relatedSlug)} key={relatedSlug}>
              <span>GUIDE</span>
              <h3>{GUIDES[relatedSlug].heading}</h3>
              <p>{GUIDES[relatedSlug].description}</p>
            </Link>
          ))}
        </div>
      </section>
      <p className="docs-updated">
        Last updated <time dateTime={entry.updated}>{formatDate(entry.updated)}</time>
      </p>
      <JsonLd nodes={nodes} />
    </>
  );
}
