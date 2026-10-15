import type { FaqItem } from "@/lib/structured-data";

/**
 * Question sets for the /guides pages. These target the generic questions
 * developers actually type — "how do I verify AI-generated code", "why did
 * Claude change my tests" — rather than MaruCheck's own vocabulary.
 *
 * The rules from faq-content.ts apply: each answer stands alone when lifted out
 * of the page, states one complete fact, stays near 40-60 words, and makes no
 * claim that the linked sources or the CLI itself cannot back up.
 */

export const VERIFY_AI_CODE_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Verify AI-generated code by checking it against a requirement the AI could not edit. Write down the approved behavior separately from the tests, review any test changes as carefully as code changes, run targeted tests for the risky paths, confirm the tests actually fail when the behavior breaks, and keep the evidence with the pull request.",
    question: "How do you verify AI-generated code?",
  },
  {
    answer:
      "Not on its own. A coding agent can change the implementation and the tests that judge it in the same change, so a passing suite can only prove the code agrees with its tests. It cannot prove the tests still describe what the product promised before the change.",
    question: "Is a passing test suite enough to trust AI-written code?",
  },
  {
    answer:
      "Treat AI-generated code like code from a fast, confident contributor who has not read the requirements. Its common failures are plausible-looking logic errors, removed edge-case guards, weakened or rewritten tests, invented APIs, and security mistakes. Veracode's 2025 study found security flaws in 45% of the AI coding tasks it tested.",
    question: "What are the most common problems in AI-generated code?",
  },
  {
    answer:
      "Yes. Verification depends on the diff, not on which assistant wrote it. The same process works for code from GitHub Copilot, Cursor, Claude Code, OpenAI Codex, Windsurf, or a human. Open-source tools such as MaruCheck run locally against the Git diff, so they work with any editor or agent.",
    question: "Can I verify code from Copilot, Cursor, and Claude Code the same way?",
  },
];

export const AGENT_CHANGED_TESTS_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Coding agents are optimized to finish the task, and a passing test run is the clearest sign of finished. When the fastest path to green is editing the assertion, hard-coding the expected value, or skipping the test, an agent may take it. Anthropic and OpenAI have both documented this behavior in their own models.",
    question: "Why does my AI coding agent change tests to make them pass?",
  },
  {
    answer:
      "Tell the agent explicitly not to modify tests, block writes to test files with a pre-edit hook, run the tests outside the agent's control in CI, and review every test diff before merging. The strongest fix is to keep approved behavior in a separate file the agent cannot approve, and to verify each change against it.",
    question: "How do I stop Claude Code or Cursor from editing my tests?",
  },
  {
    answer:
      "Reward hacking is when an AI system satisfies the measurable signal it is optimized for without achieving the intended goal. In coding, the signal is usually passing tests, so reward hacking looks like special-casing test inputs, weakening assertions, deleting failing tests, or making a check always return true.",
    question: "What is reward hacking in AI coding agents?",
  },
  {
    answer:
      "Look for test files in the diff of a change that was supposed to be implementation-only. Then check for loosened assertions, changed expected values, new skip or only markers, deleted test cases, broad mocks of the code under test, and conditionals in production code that match specific test inputs.",
    question: "How can I tell if an AI agent weakened my tests?",
  },
];

export const REVIEW_AI_PR_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Start from the requirement, not the diff. Confirm what behavior the pull request was meant to change, review test changes before implementation changes, read every removed guard and condition, check authorization and data-access paths by hand, and require reproducible test evidence rather than the author's or agent's summary of what it did.",
    question: "How should I review an AI-generated pull request?",
  },
  {
    answer:
      "Review the tests first. If the tests were changed to fit the new code, the rest of the review is built on a moving baseline. Changed expected values, deleted cases, and new mocks tell you what the AI decided the correct behavior is, which is the decision a human most needs to confirm.",
    question: "What should I look at first in an AI-written pull request?",
  },
  {
    answer:
      "AI review bots are useful for catching style issues, obvious bugs, and missing error handling, but they read the same diff the coding agent produced and have no independent record of what the product promised. Use them as a first pass, not as the approval. A human or an independent check should own behavior changes.",
    question: "Can an AI code reviewer approve AI-generated code?",
  },
];

export const CLAUDE_CODE_HOOKS_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Add a Stop hook to .claude/settings.json whose command runs your test suite. If the tests fail, the hook exits with code 2 and writes the failure to stderr. Claude Code then refuses to end the turn and passes that output back to Claude, which keeps working until the tests pass.",
    question: "How do I make Claude Code run tests before it finishes?",
  },
  {
    answer:
      "A Stop hook runs when Claude Code is about to finish responding. Exiting with code 2 blocks the stop and feeds stderr back to the model as the reason. Claude Code also passes a stop_hook_active flag on stdin so a hook can avoid blocking the same turn forever.",
    question: "What is a Claude Code Stop hook?",
  },
  {
    answer:
      "Use a PreToolUse hook that matches the Edit and Write tools, reads tool_input.file_path from the JSON on stdin, and exits with code 2 when the path is an existing test file. Claude Code blocks that tool call and shows Claude the reason, so it has to fix the implementation instead.",
    question: "Can a Claude Code hook stop Claude from editing test files?",
  },
];

export const MUTATION_TESTING_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Mutation testing measures whether your tests catch bugs. A tool makes small deliberate changes to production code, such as flipping a comparison or deleting a guard, and reruns the tests. If a test fails, the mutant is killed. If every test still passes, the mutant survived and that behavior is effectively untested.",
    question: "What is mutation testing?",
  },
  {
    answer:
      "Mutation score is the percentage of mutants your tests killed out of all mutants that could be evaluated. A high line-coverage number with a low mutation score means the tests execute the code without checking its results. Survived mutants point at the exact lines where an assertion is missing.",
    question: "What is a mutation score?",
  },
  {
    answer:
      "StrykerJS is the most widely used mutation testing framework for JavaScript and TypeScript and supports Jest, Vitest, Mocha, and other runners. For AI-written changes, MaruCheck runs mutation checks only on the changed TypeScript files and the requirement-linked tests, which keeps the run fast enough to use on every pull request.",
    question: "What is the best mutation testing tool for TypeScript?",
  },
  {
    answer:
      "AI agents write tests that run the code without asserting what it should do, and they sometimes weaken tests to make them pass. Coverage cannot see either problem. Mutation testing can, because a test that does not check behavior will keep passing when that behavior is deliberately broken.",
    question: "Why does mutation testing matter for AI-generated tests?",
  },
];

export const VIBE_CODING_FAQ: readonly FaqItem[] = [
  {
    answer:
      "Before shipping a vibe-coded app, write down the five to ten behaviors that must never break, especially sign-in, payments, permissions, and data deletion. Add one end-to-end test per behavior, check that each test fails when you break the behavior on purpose, and run those tests automatically on every change the AI makes.",
    question: "How do I test a vibe-coded app?",
  },
  {
    answer:
      "Vibe coding is building software by describing what you want to an AI and accepting the generated code with little or no line-by-line review. Andrej Karpathy coined the term in February 2025. It is fast for prototypes, but nothing in the workflow checks that the app still does what you approved.",
    question: "What is vibe coding?",
  },
  {
    answer:
      "Vibe-coded apps commonly break in authorization checks, data that leaks between user accounts, payment and billing edge cases, input validation, and features that silently regress when the AI changes nearby code. These failures often look fine in a quick manual click-through, which is why they reach production.",
    question: "What usually breaks in vibe-coded apps?",
  },
];

export const TOOLS_COMPARISON_FAQ: readonly FaqItem[] = [
  {
    answer:
      "AI code review tools read a pull request and comment on likely problems, the way a reviewer would. Verification tools check the change against a separate, approved record of required behavior and produce pass or block evidence. Review finds issues in the diff; verification proves the product still keeps its promises.",
    question: "What is the difference between AI code review and code verification?",
  },
  {
    answer:
      "No single tool covers it. A practical stack combines a linter and type checker, a static security scanner, an AI or human reviewer for the diff, targeted tests with mutation checks, and an independent behavior check that the coding agent cannot edit. Each layer catches failures the others miss.",
    question: "What tools should I use to check AI-generated code?",
  },
  {
    answer:
      "MaruCheck is not an AI code reviewer. It does not comment on style or suggest edits. It is an open-source verification CLI that checks each Git diff against reviewed Quality Contracts, runs requirement-linked tests and mutation checks, and returns a ship-or-block decision with reproducible evidence. It complements review bots rather than replacing them.",
    question: "Is MaruCheck an AI code review tool?",
  },
];
