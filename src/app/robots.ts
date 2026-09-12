import type { MetadataRoute } from "next";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

/** Authenticated and machine-only routes. Never useful in a search or AI answer. */
const privatePaths = [
  "/accept-invitation",
  "/api/",
  "/contracts",
  "/coverage",
  "/dashboard",
  "/feedback",
  "/findings",
  "/memory",
  "/onboarding",
  "/organization",
  "/projects",
  "/runs",
  "/sign-in",
];

/**
 * Crawlers belonging to answer engines. They are listed explicitly rather than
 * relying on the wildcard rule so the intent is unambiguous: blocking any of
 * these means that engine cannot cite MaruCheck at all.
 */
const answerEngineAgents = [
  "GPTBot", // OpenAI — ChatGPT training and browsing
  "OAI-SearchBot", // OpenAI — ChatGPT search index
  "ChatGPT-User", // OpenAI — live retrieval for a user prompt
  "ClaudeBot", // Anthropic — Claude
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot", // Perplexity — index
  "Perplexity-User", // Perplexity — live retrieval
  "Google-Extended", // Gemini and AI Overviews grounding
  "Applebot-Extended",
  "Bingbot", // Microsoft Copilot, via Bing
  "DuckAssistBot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "MistralAI-User",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    host: MARUCHECK_PRODUCTION_ORIGIN,
    rules: [
      {
        allow: "/",
        disallow: privatePaths,
        userAgent: "*",
      },
      ...answerEngineAgents.map((userAgent) => ({
        allow: "/",
        disallow: privatePaths,
        userAgent,
      })),
    ],
    sitemap: `${MARUCHECK_PRODUCTION_ORIGIN}/sitemap.xml`,
  };
}
