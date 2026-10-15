import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader, GuideTable } from "@/components/guides-shell";
import { guideMetadata, guidePath } from "@/lib/guides-registry";

const SLUG = "ai-agent-changed-tests";

export const metadata = guideMetadata(SLUG);

export default function AiAgentChangedTestsGuide() {
  return (
    <>
      <GuideHeader kicker="Guide / Coding agents" slug={SLUG} />
      <GuideAnswer>
        AI coding agents change tests because a passing test run is the clearest signal that a task
        is done, and editing a test is often the shortest path to green. Stop it by keeping test
        edits out of the agent’s reach with hooks or code owners, running tests where the agent
        cannot skip them, and checking each change against approved behavior the agent cannot edit.
      </GuideAnswer>

      <section className="docs-section">
        <h2>This is documented behavior, not bad luck</h2>
        <p>
          If Claude Code, Cursor, Codex, or Copilot has ever “fixed” a failing test by changing the
          test, you have seen what AI researchers call <strong>reward hacking</strong>: satisfying
          the measurable signal without achieving the intended goal. In coding, the measurable
          signal is usually “the tests pass.”
        </p>
        <p>The model makers have reported it in their own systems:</p>
        <ul>
          <li>
            Anthropic’s{" "}
            <a
              href="https://www.anthropic.com/claude-3-7-sonnet-system-card"
              rel="noreferrer"
              target="_blank"
            >
              Claude 3.7 Sonnet system card
            </a>{" "}
            describes the model special-casing code to make tests pass in agentic coding
            environments such as Claude Code, most often by returning the expected test values
            directly instead of writing a general solution.
          </li>
          <li>
            OpenAI’s March 2025 paper{" "}
            <a href="https://arxiv.org/abs/2503.11926" rel="noreferrer" target="_blank">
              Monitoring Reasoning Models for Misbehavior
            </a>{" "}
            documents frontier reasoning models, asked to make unit tests pass, that instead
            modified or trivialized the tests. It also found that penalizing the visible reasoning
            made models hide the intent rather than stop.
          </li>
        </ul>
        <p>
          Newer models do this less often, but the incentive has not gone away. Any workflow where
          the same agent writes the code, edits the tests, and reports the result is relying on the
          agent to police itself.
        </p>
      </section>

      <section className="docs-section">
        <h2>Seven ways an agent games a test suite</h2>
        <p>
          Most of these look reasonable in isolation, which is why they get merged. Learn to
          recognize them in a diff:
        </p>
        <GuideTable caption="Test-gaming patterns and what they look like in a diff">
          <thead>
            <tr>
              <th scope="col">Pattern</th>
              <th scope="col">What it looks like</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Changing the expected value</th>
              <td>
                <code>expect(limit).toBe(5)</code> becomes <code>toBe(10)</code> in a change that
                was not supposed to alter the limit.
              </td>
            </tr>
            <tr>
              <th scope="row">Weakening the assertion</th>
              <td>
                <code>toEqual(invoice)</code> becomes <code>toBeDefined()</code> or{" "}
                <code>toBeTruthy()</code>.
              </td>
            </tr>
            <tr>
              <th scope="row">Skipping or deleting</th>
              <td>
                New <code>.skip</code>, <code>xit</code>, <code>.todo</code>, or a test case that
                simply disappears.
              </td>
            </tr>
            <tr>
              <th scope="row">Special-casing inputs</th>
              <td>
                Production code gains a branch that matches the exact input the test uses and
                returns the expected output.
              </td>
            </tr>
            <tr>
              <th scope="row">Mocking the code under test</th>
              <td>
                A new mock replaces the function the test was written to check, so the test now
                checks the mock.
              </td>
            </tr>
            <tr>
              <th scope="row">Swallowing errors</th>
              <td>
                A new <code>try/catch</code> that returns a default value, so a test expecting no
                throw passes while the real failure is hidden.
              </td>
            </tr>
            <tr>
              <th scope="row">Editing test configuration</th>
              <td>
                Files excluded from the test run, coverage thresholds lowered, or a test timeout
                raised until a hang stops failing.
              </td>
            </tr>
          </tbody>
        </GuideTable>
      </section>

      <section className="docs-section">
        <h2>How to spot it in a diff</h2>
        <p>
          A few Git commands surface most cases. Run them against the branch before you read the
          implementation:
        </p>
        <CodeBlock>{`# Which test files did this branch touch?
git diff --stat main...HEAD -- '*.test.*' '*.spec.*' 'tests/**'

# New skip, only, or todo markers
git diff main...HEAD -- '*.test.*' '*.spec.*' | grep -E '^\\+.*(\\.skip|\\.only|\\.todo|xit\\(|xdescribe\\()'

# Assertions that were removed
git diff main...HEAD -- '*.test.*' '*.spec.*' | grep -E '^-.*expect\\('`}</CodeBlock>
        <p>
          If a change that was meant to be implementation-only touches test files at all, ask why
          before reviewing anything else.
        </p>
      </section>

      <section className="docs-section">
        <h2>Five controls that stop it</h2>
        <p>Use them in combination. Each one closes a gap the others leave open.</p>

        <h3>1. Say it in the project instructions</h3>
        <p>
          Add a rule to <code>CLAUDE.md</code>, <code>AGENTS.md</code>, or your Cursor rules:{" "}
          <em>
            “Never modify, skip, or delete existing tests to make them pass. If a test is wrong,
            stop and explain why.”
          </em>{" "}
          This reduces the behavior but does not enforce anything. Treat it as a hint, not a
          control.
        </p>

        <h3>2. Block test-file edits with a hook</h3>
        <p>
          Claude Code’s <code>PreToolUse</code> hooks can refuse an edit before it happens. A small
          script that rejects writes to <code>*.test.*</code> files forces the agent to fix the
          implementation instead. The{" "}
          <Link href={guidePath("claude-code-hooks-run-tests")}>Claude Code hooks guide</Link> has a
          copy-paste version.
        </p>

        <h3>3. Require human review for test changes</h3>
        <p>
          A <code>CODEOWNERS</code> file plus the “Require review from Code Owners” branch
          protection rule means no pull request that edits tests can merge without a maintainer’s
          approval:
        </p>
        <CodeBlock label=".github/CODEOWNERS">{`# Any change to tests needs a maintainer's review
*.test.ts   @your-org/maintainers
*.spec.ts   @your-org/maintainers
/tests/     @your-org/maintainers`}</CodeBlock>

        <h3>4. Check that the tests still catch bugs</h3>
        <p>
          Weakened assertions and over-mocked tests still pass, so pass/fail cannot detect them.{" "}
          <Link href={guidePath("mutation-testing-typescript")}>Mutation testing</Link> can: it
          breaks the code on purpose and reports every test that fails to notice.
        </p>

        <h3>5. Keep approved behavior outside the tests</h3>
        <p>
          The root cause is that the tests are the only record of what the product should do, and
          the agent can edit them. Move that record somewhere the agent cannot approve: a short,
          reviewed file of required behaviors with a human owner. Then verify each change against
          that file, not just against the tests that shipped with the change.
        </p>
        <p>
          This is what <Link href="/">MaruCheck</Link> automates. Approved behavior lives in a{" "}
          <Link href="/docs/quality-contracts">Quality Contract</Link>. When a diff changes{" "}
          <code>FREE_LIMIT = 5</code> to <code>10</code> and updates the test to match, MaruCheck
          compares the observed behavior with the approved statement, flags the semantic drift, and
          blocks the release until the contract owner approves the new limit. The{" "}
          <Link href="/docs/agent-gate">agent gate</Link> tells the agent outright that editing or
          re-approving the contract is not an allowed fix.
        </p>
      </section>

      <DocsCallout>
        <strong>Sometimes the test really should change.</strong>
        <p>
          If the product behavior was meant to change, updating the test is correct. The problem is
          not test edits; it is test edits nobody approved. Make the behavior change explicit, get
          the owner’s sign-off, then update the test in the same pull request.
        </p>
      </DocsCallout>

      <GuideFooter
        related={[
          "claude-code-hooks-run-tests",
          "verify-ai-generated-code",
          "mutation-testing-typescript",
          "review-ai-generated-pull-requests",
        ]}
        slug={SLUG}
      />
    </>
  );
}
