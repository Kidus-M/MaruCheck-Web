import type { MetadataRoute } from "next";
import { DOCS_PAGES, docsPath } from "@/lib/docs-registry";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

type PublicEntry = {
  readonly changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  readonly lastModified: string;
  readonly path: string;
  readonly priority: number;
};

/**
 * Marketing pages, ordered by how much each one answers on its own. Dates are
 * declared rather than taken from build time: a sitemap that reports every page
 * as changed on every deploy teaches crawlers to ignore its dates.
 */
const marketingEntries: readonly PublicEntry[] = [
  { changeFrequency: "weekly", lastModified: "2026-09-12", path: "", priority: 1 },
  { changeFrequency: "monthly", lastModified: "2026-09-12", path: "/product", priority: 0.9 },
  { changeFrequency: "monthly", lastModified: "2026-09-12", path: "/faq", priority: 0.9 },
  { changeFrequency: "monthly", lastModified: "2026-09-12", path: "/open-source", priority: 0.7 },
  { changeFrequency: "yearly", lastModified: "2026-09-12", path: "/about", priority: 0.6 },
  { changeFrequency: "monthly", lastModified: "2026-09-12", path: "/llms.txt", priority: 0.5 },
  { changeFrequency: "monthly", lastModified: "2026-09-12", path: "/pricing.md", priority: 0.5 },
];

/** Pages an answer engine is most likely to quote get the higher priority. */
const docsPriority: Partial<Record<keyof typeof DOCS_PAGES, number>> = {
  "": 0.8,
  cli: 0.8,
  "getting-started": 0.9,
  mcp: 0.8,
  "qa-memory": 0.8,
  "quality-contracts": 0.8,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const docsEntries: readonly PublicEntry[] = Object.entries(DOCS_PAGES).map(([slug, entry]) => ({
    changeFrequency: "monthly",
    lastModified: entry.updated,
    path: docsPath(slug as keyof typeof DOCS_PAGES),
    priority: docsPriority[slug as keyof typeof DOCS_PAGES] ?? 0.7,
  }));

  return [...marketingEntries, ...docsEntries].map((entry) => ({
    changeFrequency: entry.changeFrequency,
    lastModified: entry.lastModified,
    priority: entry.priority,
    url: `${MARUCHECK_PRODUCTION_ORIGIN}${entry.path}`,
  }));
}
