import { DocsFaq } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import type { DocSlug } from "@/lib/docs-registry";
import { DOCS_PAGES, docsPath } from "@/lib/docs-registry";
import type { JsonLdNode } from "@/lib/structured-data";
import { breadcrumbSchema, faqSchema, techArticleSchema } from "@/lib/structured-data";

/**
 * Publishes the answer-engine surface for one documentation page: a visible
 * "last updated" line, the page's FAQ block when it has one, and the matching
 * TechArticle, BreadcrumbList, and FAQPage markup.
 *
 * Render it as the last element of a docs page so the freshness line closes the
 * article and the FAQ sits after the material it answers questions about.
 */
export function DocsPageSchema({
  extraNodes = [],
  slug,
}: {
  readonly extraNodes?: readonly JsonLdNode[];
  readonly slug: DocSlug;
}) {
  const entry = DOCS_PAGES[slug];
  const path = docsPath(slug);
  const faq = "faq" in entry ? entry.faq : undefined;

  const nodes: JsonLdNode[] = [
    techArticleSchema({
      description: entry.description,
      path,
      title: entry.title,
      updated: entry.updated,
    }),
    breadcrumbSchema(
      slug === ""
        ? [
            { name: "MaruCheck", path: "/" },
            { name: "Documentation", path: "/docs" },
          ]
        : [
            { name: "MaruCheck", path: "/" },
            { name: "Documentation", path: "/docs" },
            { name: entry.title, path },
          ],
    ),
    ...(faq ? [faqSchema(faq)] : []),
    ...extraNodes,
  ];

  return (
    <>
      {faq ? <DocsFaq items={faq} /> : null}
      <p className="docs-updated">
        Last updated{" "}
        <time dateTime={entry.updated}>
          {new Date(`${entry.updated}T00:00:00Z`).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            timeZone: "UTC",
            year: "numeric",
          })}
        </time>
      </p>
      <JsonLd nodes={nodes} />
    </>
  );
}
