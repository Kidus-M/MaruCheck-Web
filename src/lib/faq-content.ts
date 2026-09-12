import type { FaqItem } from "@/lib/structured-data";

/**
 * Answer-engine copy. Every answer is written to stand alone when it is lifted
 * out of the page: it names MaruCheck instead of saying "it", states one
 * complete fact, and stays near 40-60 words so the whole answer survives
 * extraction rather than being truncated mid-claim.
 *
 * Only claims verifiable from the CLI, the docs, or the repository belong here.
 * Nothing about hosted pricing is asserted, because none has been announced.
 */

export const DEFINITION_ANSWER =
  "MaruCheck is an open-source verification tool that independently checks whether AI-generated code still satisfies approved product behavior. It records the behavior a release must preserve in reviewed Quality Contracts, then challenges every Git diff against that record — instead of trusting the test suite the coding agent just rewrote.";

export const HOME_FAQ: readonly FaqItem[] = [
  {
    answer: DEFINITION_ANSWER,
    question: "What is MaruCheck?",
  },
  {
    answer:
      "A coding agent can change the implementation and the tests that judge it in the same commit, so a green suite only proves the code agrees with itself. MaruCheck keeps approved behavior in a separate, human-owned Quality Contract, so a passing test run cannot quietly redefine what the product promised.",
    question: "Why isn't a passing test suite enough for AI-generated code?",
  },
  {
    answer:
      "MaruCheck reads the real Git diff, scores risk on a deterministic 0-100 scale, builds a requirement-linked verification plan, recalls confirmed regressions from QA Memory, runs the targeted checks, and writes reproducible evidence under .maru/. The result is a ship-or-block decision with receipts, not a confidence score.",
    question: "How does MaruCheck verify a change?",
  },
  {
    answer:
      "A Quality Contract is a reviewed YAML file recording durable product behavior: the feature, its criticality, accountable owners, requirement statements with stable IDs, and an evidence policy naming which requirements block a release. Owners approve it, and it is versioned whenever product intent genuinely changes.",
    question: "What is a Quality Contract?",
  },
  {
    answer:
      "Semantic drift is when code changes meaning while its tests are updated to keep passing. MaruCheck compares the observed behavior of a diff against the approved contract statement — for example a free-plan limit moving from 5 to 10 projects — and requires owner approval before that changed promise can ship.",
    question: "What is semantic drift detection?",
  },
  {
    answer:
      "No. MaruCheck runs locally in your repository or inside your own CI runner, so source code, tests, and secrets never leave that boundary. Verification output is written to the .maru/ directory in the repository, where you can read, diff, and review it like any other file.",
    question: "Does MaruCheck send my source code to a server?",
  },
  {
    answer:
      "Yes. MaruCheck ships an MCP server, so Codex, Claude Code, Cursor, and other compatible clients can inspect contracts, assess risk, and run verification as tool calls. The agent may request the check and read structured evidence, but approving a contract change stays human-owned.",
    question: "Can AI coding agents run MaruCheck themselves?",
  },
  {
    answer:
      "MaruCheck is free and MIT licensed. The CLI is published on npm as the marucheck package, and both the verifier and this web application are public repositories you can read, run, fork, and contribute to before trusting either one in a release path.",
    question: "Is MaruCheck free and open source?",
  },
];

export const PRODUCT_FAQ: readonly FaqItem[] = [
  {
    answer:
      "MaruCheck spends verification effort where a change can actually hurt. Risk scoring is deterministic and explainable: changed file paths, the criticality of the contracts they touch, existing coverage gaps, and matching QA Memory entries each contribute a stated amount to a 0-100 score you can audit.",
    question: "How does MaruCheck decide what to test?",
  },
  {
    answer:
      "QA Memory is MaruCheck's record of confirmed past failures. When code related to an earlier bug changes again, MaruCheck recalls that failure and forces its regression test back into the verification plan, so a bug diagnosed once cannot silently return in a later AI-authored change.",
    question: "What is QA Memory?",
  },
  {
    answer:
      "Mutation checking tests the tests. MaruCheck introduces isolated changes into the code a test claims to protect and confirms the test actually fails. A test that still passes against a mutated implementation is not protecting the requirement it is mapped to, and MaruCheck reports it.",
    question: "How does MaruCheck check whether the tests are real?",
  },
  {
    answer:
      "MaruCheck produces an inspectable release decision, not a score. Every block cites the requirement ID it protects, the contract that requirement belongs to, the evidence collected during the run, and the commands needed to reproduce it, so a reviewer can audit the decision instead of taking it on trust.",
    question: "What does MaruCheck produce at the end of a run?",
  },
];

export const OPEN_SOURCE_FAQ: readonly FaqItem[] = [
  {
    answer:
      "MaruCheck is released under the MIT license. You may read, run, modify, self-host, and redistribute it, including commercially. The verifier and the web application are maintained as two public repositories so you can inspect exactly what runs before putting it in a release path.",
    question: "What license does MaruCheck use?",
  },
  {
    answer:
      "MaruCheck is split into two repositories. Kidus-M/MaruCheck holds the CLI: Quality Contracts, risk analysis, verification plans, evidence, QA Memory, semantic drift, MCP, and CI. Kidus-M/MaruCheck-Web holds the public site, authenticated dashboard, project connections, report ingestion, and production feedback.",
    question: "Where is the MaruCheck source code?",
  },
  {
    answer:
      "Yes. MaruCheck accepts focused contributions through its public CONTRIBUTING guide, which describes the expected workflow, checks, and review expectations. Reading the verifier's source before adopting it is encouraged — an independent check is only worth running if you can audit what it actually does.",
    question: "Can I contribute to MaruCheck?",
  },
];

export const GETTING_STARTED_FAQ: readonly FaqItem[] = [
  {
    answer:
      "MaruCheck requires Node.js 24 or newer, npm 11 or newer, and Git. Run it from the root of the repository you want to verify. MaruCheck targets Next.js, React, and TypeScript projects, and maps requirements to Vitest, Jest, and Playwright test adapters.",
    question: "What do I need to run MaruCheck?",
  },
  {
    answer:
      "Install MaruCheck as an exact dev dependency with npm install --save-dev --save-exact marucheck, then run maru init to create the .maru/ workspace. Initialization is idempotent: it does not overwrite existing configuration, and it manages ignore rules for generated plans, run artifacts, and local credentials.",
    question: "How do I install MaruCheck?",
  },
  {
    answer:
      "No. Local verification works entirely from the CLI. Connect MaruCheck's MCP server only when you want Codex, Claude Code, or Cursor to inspect contracts and run verification for you. MaruCheck uses the AI client you already have and requires no second model provider or API key.",
    question: "Do I need an MCP client or an API key to use MaruCheck?",
  },
  {
    answer:
      "Start with one real change in a repository you already use. MaruCheck can produce an inspectable local release decision before you connect a dashboard, an AI client, or CI, so you can evaluate the verifier end to end without changing your release process first.",
    question: "Can I try MaruCheck without connecting anything?",
  },
];

export const CI_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Run maru ci init to install a least-privilege GitHub Actions pull-request workflow. The workflow verifies the diff on each pull request and retains the run's evidence even when the gate blocks, so a failed check leaves an artifact reviewers can open rather than only a red mark.",
    question: "How do I add MaruCheck to CI?",
  },
  {
    answer:
      "MaruCheck runs inside your own CI runner, so source and secrets stay within the boundary you already trust for builds. Uploading a report to the hosted dashboard is a separate, explicit step authenticated with a project token you issue and can revoke.",
    question: "Does MaruCheck need access to my CI secrets?",
  },
];

export const MCP_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Start MaruCheck's local stdio MCP server with maru mcp and register it in your client. Codex, Claude Code, Cursor, and other compatible MCP clients can then inspect Quality Contracts, assess diff risk, run verification, and coordinate a separate Challenger review as structured tool calls.",
    question: "How do I connect MaruCheck to Claude Code, Codex, or Cursor?",
  },
  {
    answer:
      "The agent may run the verifier and read its structured evidence, but it cannot approve its own work. Approving a Quality Contract or accepting a changed behavior requires an accountable human owner, which is what keeps the verification independent of the model that wrote the code.",
    question: "Can the coding agent approve its own MaruCheck result?",
  },
];

export const CONTRACTS_FAQ: readonly FaqItem[] = [
  {
    answer:
      "A Quality Contract records the feature name, its criticality, accountable owners, requirement statements with stable IDs such as SUB-004, and an evidence policy listing which requirement IDs block a release. Each requirement is mapped to real tests and versioned whenever the approved product intent changes.",
    question: "What goes into a Quality Contract?",
  },
  {
    answer:
      "Create contracts from existing requirements with maru contract create --from requirements.md, then list, show, validate, diff, and approve them from the CLI. Approval is recorded against a named owner, so a contract change always carries the identity of the person who accepted the new behavior.",
    question: "How do I create and approve a Quality Contract?",
  },
  {
    answer:
      "A contract holds the promise; the tests are one form of evidence that the promise still holds. Because an AI agent can rewrite tests and implementation together, MaruCheck keeps the approved statement in a separate reviewed file that only an accountable owner can change.",
    question: "How is a Quality Contract different from a test?",
  },
];

/** Superset used by the standalone /faq page. */
export const ALL_FAQ: readonly FaqItem[] = [
  ...HOME_FAQ,
  ...PRODUCT_FAQ,
  ...GETTING_STARTED_FAQ,
  ...CONTRACTS_FAQ,
  ...MCP_FAQ,
  ...CI_FAQ,
  ...OPEN_SOURCE_FAQ,
];
