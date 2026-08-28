import type { MetadataRoute } from "next";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

const publicPaths = [
  "",
  "/about",
  "/docs",
  "/docs/agent-gate",
  "/docs/ci",
  "/docs/cli",
  "/docs/getting-started",
  "/docs/mcp",
  "/docs/production-feedback",
  "/docs/quality-contracts",
  "/docs/report-ingestion",
  "/open-source",
  "/product",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/docs/getting-started" ? 0.9 : 0.7,
    url: `${MARUCHECK_PRODUCTION_ORIGIN}${path}`,
  }));
}
