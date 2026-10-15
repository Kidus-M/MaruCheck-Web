import type { Metadata } from "next";
import type { FaqItem } from "@/lib/structured-data";
import {
  AGENT_CHANGED_TESTS_FAQ,
  CLAUDE_CODE_HOOKS_FAQ,
  MUTATION_TESTING_FAQ,
  REVIEW_AI_PR_FAQ,
  TOOLS_COMPARISON_FAQ,
  VERIFY_AI_CODE_FAQ,
  VIBE_CODING_FAQ,
} from "@/lib/guides-faq";
import { buildPageMetadata } from "@/lib/seo";

/**
 * One record per guide. Guides are the site's answer to generic, unbranded
 * searches — the docs explain MaruCheck to people who already found it; the
 * guides are how people who have never heard of it find it.
 *
 * `title` is the search-result title, so it mirrors how the question is typed.
 * `heading` is the on-page H1 and can read more naturally. Bump `updated` on
 * any meaningful content change; it is published as `dateModified`.
 */
type GuideEntry = {
  readonly description: string;
  readonly faq: readonly FaqItem[];
  readonly heading: string;
  readonly keywords: readonly string[];
  readonly navLabel: string;
  readonly published: string;
  readonly readingMinutes: number;
  readonly title: string;
  readonly updated: string;
};

export const GUIDES = {
  "verify-ai-generated-code": {
    description:
      "A tool-agnostic process for verifying code from Claude Code, Cursor, Copilot, or Codex: keep the spec outside the tests, target risk, and test the tests.",
    faq: VERIFY_AI_CODE_FAQ,
    heading: "How to verify AI-generated code before it ships",
    keywords: [
      "how to verify AI generated code",
      "how to test AI generated code",
      "validate AI code",
      "AI code quality",
      "trust AI generated code",
    ],
    navLabel: "Verify AI-generated code",
    published: "2026-10-15",
    readingMinutes: 9,
    title: "How to Verify AI-Generated Code Before It Ships",
    updated: "2026-10-15",
  },
  "ai-agent-changed-tests": {
    description:
      "Why Claude Code, Cursor, and other coding agents edit, weaken, or skip tests to get a green run, how to spot it in a diff, and five controls that stop it.",
    faq: AGENT_CHANGED_TESTS_FAQ,
    heading: "Why AI coding agents change tests to make them pass",
    keywords: [
      "AI changed my tests",
      "Claude Code modifies tests",
      "Cursor deletes failing tests",
      "AI reward hacking tests",
      "stop AI from editing tests",
    ],
    navLabel: "AI changed my tests",
    published: "2026-10-15",
    readingMinutes: 8,
    title: "AI Agent Changed Your Tests to Pass? How to Stop It",
    updated: "2026-10-15",
  },
  "review-ai-generated-pull-requests": {
    description:
      "A reviewer's checklist for AI-written pull requests: what to read first, failure patterns that look correct, and what evidence to require before approving.",
    faq: REVIEW_AI_PR_FAQ,
    heading: "How to review an AI-generated pull request",
    keywords: [
      "review AI generated code",
      "AI pull request review checklist",
      "code review AI code",
      "reviewing Copilot code",
    ],
    navLabel: "Review AI pull requests",
    published: "2026-10-15",
    readingMinutes: 7,
    title: "How to Review AI-Generated Pull Requests: A Checklist",
    updated: "2026-10-15",
  },
  "claude-code-hooks-run-tests": {
    description:
      "Copy-paste Claude Code hooks that run your tests before Claude can finish a turn and block edits to existing test files, with exit codes explained.",
    faq: CLAUDE_CODE_HOOKS_FAQ,
    heading: "Run tests automatically with Claude Code hooks",
    keywords: [
      "Claude Code hooks",
      "Claude Code Stop hook",
      "Claude Code run tests automatically",
      "Claude Code PreToolUse hook",
      "settings.json hooks",
    ],
    navLabel: "Claude Code hooks for tests",
    published: "2026-10-15",
    readingMinutes: 7,
    title: "Run Tests Automatically With Claude Code Hooks",
    updated: "2026-10-15",
  },
  "mutation-testing-typescript": {
    description:
      "What mutation testing is, how to read a mutation score, running StrykerJS with Jest or Vitest, and mutation-testing only the code an AI just changed.",
    faq: MUTATION_TESTING_FAQ,
    heading: "Mutation testing in TypeScript and JavaScript",
    keywords: [
      "mutation testing",
      "mutation testing TypeScript",
      "StrykerJS",
      "mutation score",
      "test quality",
    ],
    navLabel: "Mutation testing (TS/JS)",
    published: "2026-10-15",
    readingMinutes: 8,
    title: "Mutation Testing in TypeScript and JavaScript",
    updated: "2026-10-15",
  },
  "test-vibe-coded-app": {
    description:
      "A one-afternoon plan to test an app you built with AI: list what must never break, cover it end to end, prove the tests work, and gate future changes.",
    faq: VIBE_CODING_FAQ,
    heading: "How to test a vibe-coded app before you ship it",
    keywords: [
      "vibe coding testing",
      "test vibe coded app",
      "vibe coding security",
      "ship AI built app",
    ],
    navLabel: "Test a vibe-coded app",
    published: "2026-10-15",
    readingMinutes: 7,
    title: "How to Test a Vibe-Coded App Before You Ship It",
    updated: "2026-10-15",
  },
  "ai-code-review-tools-vs-verification": {
    description:
      "AI review bots, static analysis, tests, mutation testing, and independent verification compared: what each catches in AI-generated code and what it misses.",
    faq: TOOLS_COMPARISON_FAQ,
    heading: "AI code review tools vs. verification: what each one catches",
    keywords: [
      "AI code review tools",
      "AI code review vs testing",
      "tools to check AI generated code",
      "AI code quality tools",
    ],
    navLabel: "Review tools vs. verification",
    published: "2026-10-15",
    readingMinutes: 8,
    title: "AI Code Review Tools vs. Verification: What Each Catches",
    updated: "2026-10-15",
  },
} as const satisfies Record<string, GuideEntry>;

export type GuideSlug = keyof typeof GUIDES;

export const GUIDE_SLUGS = Object.keys(GUIDES) as GuideSlug[];

export function guidePath(slug: GuideSlug): string {
  return `/guides/${slug}`;
}

export const GUIDES_HUB = {
  description:
    "Practical guides to testing AI-written code: verification workflows, stopping agents from rewriting tests, reviewing AI pull requests, and mutation testing.",
  title: "Guides to Testing and Verifying AI-Written Code",
  updated: "2026-10-15",
} as const;

export function guideMetadata(slug: GuideSlug): Metadata {
  const entry = GUIDES[slug];

  return buildPageMetadata({
    description: entry.description,
    keywords: entry.keywords,
    path: guidePath(slug),
    published: entry.published,
    title: entry.title,
    type: "article",
    updated: entry.updated,
  });
}
