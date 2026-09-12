import type { MetadataRoute } from "next";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

type PublicEntry = {
  readonly changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  readonly path: string;
  readonly priority: number;
};

/**
 * Public surface area, ordered by how much each page is expected to answer a
 * question on its own. The machine-readable files are listed too, so crawlers
 * that never render a page still discover them.
 */
const publicEntries: readonly PublicEntry[] = [
  { changeFrequency: "weekly", path: "", priority: 1 },
  { changeFrequency: "monthly", path: "/product", priority: 0.9 },
  { changeFrequency: "monthly", path: "/docs/getting-started", priority: 0.9 },
  { changeFrequency: "monthly", path: "/faq", priority: 0.9 },
  { changeFrequency: "monthly", path: "/docs", priority: 0.8 },
  { changeFrequency: "monthly", path: "/docs/quality-contracts", priority: 0.8 },
  { changeFrequency: "monthly", path: "/docs/cli", priority: 0.8 },
  { changeFrequency: "monthly", path: "/docs/mcp", priority: 0.8 },
  { changeFrequency: "monthly", path: "/docs/qa-memory", priority: 0.8 },
  { changeFrequency: "monthly", path: "/docs/ci", priority: 0.7 },
  { changeFrequency: "monthly", path: "/docs/agent-gate", priority: 0.7 },
  { changeFrequency: "monthly", path: "/docs/report-ingestion", priority: 0.7 },
  { changeFrequency: "monthly", path: "/docs/production-feedback", priority: 0.7 },
  { changeFrequency: "monthly", path: "/open-source", priority: 0.7 },
  { changeFrequency: "yearly", path: "/about", priority: 0.6 },
  { changeFrequency: "monthly", path: "/llms.txt", priority: 0.5 },
  { changeFrequency: "monthly", path: "/pricing.md", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicEntries.map((entry) => ({
    changeFrequency: entry.changeFrequency,
    lastModified,
    priority: entry.priority,
    url: `${MARUCHECK_PRODUCTION_ORIGIN}${entry.path}`,
  }));
}
