import {
  absoluteUrl,
  AUTHOR_NAME,
  OG_IMAGE,
  SITE_DEFINITION,
  SITE_NAME,
  SOCIAL_PROFILES,
} from "@/lib/seo";
import { MARUCHECK_CLI_VERSION, MARUCHECK_SOURCE_URL } from "@/lib/public-release";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

/** A single JSON-LD node. Values stay loose because schema.org shapes vary per type. */
export type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = `${MARUCHECK_PRODUCTION_ORIGIN}/#organization`;
const WEBSITE_ID = `${MARUCHECK_PRODUCTION_ORIGIN}/#website`;
const SOFTWARE_ID = `${MARUCHECK_PRODUCTION_ORIGIN}/#software`;

export function organizationSchema(): JsonLdNode {
  return {
    "@id": ORGANIZATION_ID,
    "@type": "Organization",
    description: SITE_DEFINITION,
    founder: { "@type": "Person", name: AUTHOR_NAME },
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/marucheck-logo.png"),
    },
    name: SITE_NAME,
    sameAs: [...SOCIAL_PROFILES],
    url: MARUCHECK_PRODUCTION_ORIGIN,
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    "@id": WEBSITE_ID,
    "@type": "WebSite",
    description: SITE_DEFINITION,
    inLanguage: "en",
    name: SITE_NAME,
    publisher: { "@id": ORGANIZATION_ID },
    url: MARUCHECK_PRODUCTION_ORIGIN,
  };
}

/**
 * Describes the CLI as a downloadable developer tool. The explicit zero-price
 * offer matters: agents evaluating tools filter out anything whose cost they
 * cannot read, and the CLI genuinely is free and MIT licensed.
 */
export function softwareApplicationSchema(): JsonLdNode {
  return {
    "@id": SOFTWARE_ID,
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Software Testing and Verification",
    author: { "@id": ORGANIZATION_ID },
    description: SITE_DEFINITION,
    downloadUrl: "https://www.npmjs.com/package/marucheck",
    featureList: [
      "Quality Contracts that record approved product behavior",
      "Deterministic, explainable risk scoring for a Git diff",
      "Requirement-linked verification plans",
      "Semantic drift detection between intent and implementation",
      "QA Memory that recalls confirmed regressions",
      "Mutation checks that test the tests",
      "MCP server for Codex, Claude Code, and Cursor",
      "Least-privilege GitHub Actions release gate",
    ],
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    name: SITE_NAME,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    codeRepository: MARUCHECK_SOURCE_URL,
    operatingSystem: "Linux, macOS, Windows",
    softwareRequirements: "Node.js 24 or newer, npm 11 or newer, Git",
    softwareVersion: MARUCHECK_CLI_VERSION,
    url: MARUCHECK_PRODUCTION_ORIGIN,
  };
}

export type FaqItem = {
  readonly answer: string;
  readonly question: string;
};

export function faqSchema(items: readonly FaqItem[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: item.answer },
      name: item.question,
    })),
  };
}

export type BreadcrumbEntry = {
  readonly name: string;
  readonly path: string;
};

export function breadcrumbSchema(trail: readonly BreadcrumbEntry[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(entry.path),
      name: entry.name,
      position: index + 1,
    })),
  };
}

type ArticleInput = {
  readonly description: string;
  readonly path: string;
  readonly published?: string;
  readonly title: string;
  readonly updated: string;
};

/**
 * Documentation pages publish as TechArticle so answer engines can attribute an
 * author and a last-modified date — both weigh heavily in source selection.
 */
export function techArticleSchema({
  description,
  path,
  published,
  title,
  updated,
}: ArticleInput): JsonLdNode {
  return {
    "@type": "TechArticle",
    author: { "@type": "Person", name: AUTHOR_NAME, url: MARUCHECK_SOURCE_URL },
    dateModified: updated,
    datePublished: published ?? updated,
    description,
    headline: title,
    image: absoluteUrl(OG_IMAGE.url),
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    publisher: { "@id": ORGANIZATION_ID },
    url: absoluteUrl(path),
  };
}

export type HowToStep = {
  readonly name: string;
  readonly text: string;
};

type HowToInput = {
  readonly description: string;
  readonly name: string;
  readonly path: string;
  readonly steps: readonly HowToStep[];
  readonly totalTime?: string;
};

export function howToSchema({
  description,
  name,
  path,
  steps,
  totalTime = "PT5M",
}: HowToInput): JsonLdNode {
  return {
    "@type": "HowTo",
    description,
    name,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      name: step.name,
      position: index + 1,
      text: step.text,
      url: `${absoluteUrl(path)}#step-${index + 1}`,
    })),
    supply: {
      "@type": "HowToSupply",
      name: "A Git repository with Node.js 24 or newer installed",
    },
    tool: { "@type": "HowToTool", name: `MaruCheck CLI v${MARUCHECK_CLI_VERSION}` },
    totalTime,
  };
}

/** Wraps nodes in a single @graph so each page emits exactly one JSON-LD block. */
export function graph(nodes: readonly JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}
