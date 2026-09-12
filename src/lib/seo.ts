import type { Metadata } from "next";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

export const SITE_NAME = "MaruCheck";
export const SITE_TAGLINE = "Test what your AI didn't";

/**
 * One-sentence definition reused by metadata, JSON-LD, and llms.txt so every
 * surface an answer engine reads describes the product identically.
 */
export const SITE_DEFINITION =
  "MaruCheck is an open-source verification tool that independently checks whether AI-generated code still satisfies approved product behavior, by testing every change against reviewed Quality Contracts instead of trusting the test suite the AI just rewrote.";

export const SITE_SHORT_DESCRIPTION =
  "MaruCheck independently verifies that AI-generated software still satisfies approved product behavior.";

export const AUTHOR_NAME = "Kidus Mesfin Teferi";

export const SOCIAL_PROFILES = [
  "https://github.com/Kidus-M/MaruCheck",
  "https://www.npmjs.com/package/marucheck",
] as const;

/**
 * The social card itself is produced by the `opengraph-image` file convention,
 * which injects its own cache-busted URL into every page. This constant exists
 * only so JSON-LD nodes can reference the same image by a stable path.
 */
export const OG_IMAGE_PATH = "/opengraph-image";

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
};

const SITE_KEYWORDS = [
  "AI code verification",
  "verify AI-generated code",
  "AI coding agent guardrails",
  "quality contracts",
  "semantic drift detection",
  "regression testing for AI code",
  "release gate",
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
  title,
  type = "website",
  updated,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = path === "/" ? `${SITE_NAME} — ${SITE_TAGLINE}` : `${title} · ${SITE_NAME}`;

  return {
    alternates: { canonical },
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    openGraph: {
      description,
      locale: "en_US",
      ...(type === "article" && updated ? { modifiedTime: updated } : {}),
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
      title: fullTitle,
    },
  };
}
