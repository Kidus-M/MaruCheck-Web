import type { Metadata } from "next";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

export const SITE_NAME = "MaruCheck";
export const SITE_TAGLINE = "Test what your AI didn't";

/**
 * The home page title leads with the phrase people actually search for. The
 * tagline is brand voice and stays in the hero and social card, but nobody
 * types "test what your AI didn't" into a search box.
 */
export const SITE_TITLE = `${SITE_NAME} — Verify AI-Generated Code Before It Ships`;

/**
 * One-sentence definition reused by metadata, JSON-LD, and llms.txt so every
 * surface an answer engine reads describes the product identically.
 */
export const SITE_DEFINITION =
  "MaruCheck is an open-source verification tool that independently checks whether AI-generated code still satisfies approved product behavior, by testing every change against reviewed Quality Contracts instead of trusting the test suite the AI just rewrote.";

export const SITE_SHORT_DESCRIPTION =
  "Free, open-source tool to verify AI-generated code from Claude Code, Cursor, and Codex. Catches rewritten tests, behavior drift, and repeat regressions before release.";

export const AUTHOR_NAME = "Kidus Mesfin Teferi";

export const SOCIAL_PROFILES = [
  "https://github.com/Kidus-M/MaruCheck",
  "https://www.npmjs.com/package/marucheck",
] as const;

/**
 * The card is rendered by the `opengraph-image` route, but it is referenced
 * explicitly here: pages that declare their own `openGraph` block do not pick
 * up the file convention automatically, and a social card that silently goes
 * missing is invisible in every preview and AI answer that shows one.
 */
export const OG_IMAGE_PATH = "/opengraph-image";

export const OG_IMAGE = {
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
  height: 630,
  url: OG_IMAGE_PATH,
  width: 1200,
} as const;

export function absoluteUrl(path: string): string {
  return `${MARUCHECK_PRODUCTION_ORIGIN}${path}`;
}

type PageMetadataInput = {
  readonly description: string;
  /** Route path beginning with "/" ("/" for the home page). Used as the canonical URL. */
  readonly path: string;
  /** Extra topical terms for this page, merged after the site-wide set. */
  readonly keywords?: readonly string[];
  /** ISO date of the last meaningful content change, surfaced as a freshness signal. */
  readonly updated?: string;
  readonly title: string;
  readonly type?: "article" | "website";
  /** ISO date the page first went live; only emitted for articles. */
  readonly published?: string;
};

/**
 * Search-engine ownership tokens, read at build time. Without a verified
 * property there is no Search Console or Bing Webmaster data, no sitemap
 * submission, and no way to request indexing of a new page.
 */
export function siteVerification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();

  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

const SITE_KEYWORDS = [
  "verify AI-generated code",
  "test AI-generated code",
  "AI code verification",
  "AI coding agent guardrails",
  "Claude Code testing",
  "Cursor code quality",
  "regression testing for AI code",
  "open source",
] as const;

/**
 * Builds page metadata with the canonical URL, Open Graph, and Twitter fields
 * filled in from a single source. Every public page should use this so no
 * surface drifts from the shared definition.
 */
export function buildPageMetadata({
  description,
  keywords = [],
  path,
  published,
  title,
  type = "website",
  updated,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = path === "/" ? SITE_TITLE : `${title} · ${SITE_NAME}`;

  return {
    alternates: { canonical },
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    openGraph: {
      description,
      images: [OG_IMAGE],
      locale: "en_US",
      ...(type === "article" && updated ? { modifiedTime: updated } : {}),
      ...(type === "article" && published ? { publishedTime: published } : {}),
      ...(type === "article" ? { authors: [AUTHOR_NAME] } : {}),
      siteName: SITE_NAME,
      title: fullTitle,
      type,
      url: canonical,
    },
    // The home page owns the brand title outright; every other page inherits
    // the "%s · MaruCheck" template from the root layout.
    title: path === "/" ? { absolute: fullTitle } : title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [OG_IMAGE_PATH],
      title: fullTitle,
    },
  };
}
