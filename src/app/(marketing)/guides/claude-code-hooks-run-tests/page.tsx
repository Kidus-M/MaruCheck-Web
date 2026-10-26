import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader, GuideTable } from "@/components/guides-shell";
import { fetchCliRelease } from "@/lib/cli-release";
import { guideMetadata, guidePath } from "@/lib/guides-registry";

const SLUG = "claude-code-hooks-run-tests";

export const metadata = guideMetadata(SLUG);

const SETTINGS = `{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \\"\${CLAUDE_PROJECT_DIR}/.claude/hooks/run-tests.mjs\\"",
            "timeout": 300
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node \\"\${CLAUDE_PROJECT_DIR}/.claude/hooks/protect-tests.mjs\\""
          }
        ]
      }
    ]
  }
}`;

const RUN_TESTS = `// Claude Code Stop hook: refuse to end the turn while tests fail.
import { spawnSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const { stop_hook_active } = JSON.parse(input || "{}");

const result = spawnSync("npm test --silent", { encoding: "utf8", shell: true });
if (result.status === 0) process.exit(0);

// Claude already had one retry because of this hook. Let the turn end
// instead of looping, and leave the failure for a human.
if (stop_hook_active) process.exit(0);

const tail = \`\${result.stdout}\\n\${result.stderr}\`.trim().split("\\n").slice(-40).join("\\n");
console.error(
  "Tests are failing. Fix the implementation. Do not edit, skip, or delete tests.\\n\\n" + tail,
);
process.exit(2);`;

const PROTECT_TESTS = `// Claude Code PreToolUse hook: block edits to existing test files.
import { existsSync } from "node:fs";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const file = String(JSON.parse(input).tool_input?.file_path ?? "").replaceAll("\\\\", "/");

const isTest =
  /\\.(test|spec)\\.[cm]?[jt]sx?$/.test(file) || /\\/(__tests__|tests?)\\//.test(file);

// New test files are fine. Rewriting existing ones is not.
if (!isTest || !existsSync(file)) process.exit(0);

console.error(
  \`Blocked: \${file} is an existing test. Change the implementation so it passes. \` +
    "If the test itself is wrong, stop and explain why to the user.",
);
process.exit(2);`;

export default async function ClaudeCodeHooksGuide() {
  const cli = await fetchCliRelease();
  return (
    <>
      <GuideHeader kicker="Guide / Claude Code" slug={SLUG} />
      <GuideAnswer>
        To make Claude Code run your tests automatically, add a Stop hook to{" "}
        <code>.claude/settings.json</code> that runs the test suite and exits with code 2 when it
        fails. Claude Code then refuses to end the turn and hands the failure output back to Claude.
        A PreToolUse hook on the Edit and Write tools can also block Claude from rewriting existing
        tests.
      </GuideAnswer>

      <section className="docs-section">
        <h2>Why use a hook instead of asking Claude to run tests</h2>
        <p>
          You can tell Claude to run the tests in <code>CLAUDE.md</code>, and it usually will. But
          “usually” is the problem: the agent decides whether verification happens, and the agent is
          the one that benefits from skipping it. Hooks move that decision into the harness. They
          run as ordinary shell commands at fixed points in Claude Code’s lifecycle, whether or not
          the model remembers to.
        </p>
        <p>Two hook events matter for testing:</p>
        <GuideTable caption="Claude Code hook events used in this guide">
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">When it runs</th>
              <th scope="col">Exit code 2 means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <code>Stop</code>
              </th>
              <td>When Claude is about to finish its response</td>
              <td>Claude is not allowed to stop; stderr is sent to Claude as the reason</td>
            </tr>
            <tr>
              <th scope="row">
                <code>PreToolUse</code>
              </th>
              <td>Before a tool call such as Edit or Write executes</td>
              <td>The tool call is blocked; stderr is sent to Claude as the denial reason</td>
            </tr>
          </tbody>
        </GuideTable>
        <p>
          Any other non-zero exit code is treated as a hook error rather than a block, so the
          scripts below use exactly <code>2</code>. The full reference is in{" "}
          <a href="https://code.claude.com/docs/en/hooks" rel="noreferrer" target="_blank">
            Anthropic’s hooks documentation
          </a>
          .
        </p>
      </section>

      <section className="docs-section">
        <h2>Step 1: register the hooks</h2>
        <p>
          Add this to <code>.claude/settings.json</code> in your repository so it applies to
          everyone who uses Claude Code on the project. Merge it with any hooks you already have.
        </p>
        <CodeBlock label=".claude/settings.json">{SETTINGS}</CodeBlock>
        <p>
          <code>Stop</code> does not take a matcher; it fires every time. The{" "}
          <code>PreToolUse</code> matcher <code>Edit|Write</code> limits the second hook to file
          edits. <code>timeout</code> is in seconds.
        </p>
      </section>

      <section className="docs-section">
        <h2>Step 2: run the tests before Claude can finish</h2>
        <p>
          Save this as <code>.claude/hooks/run-tests.mjs</code>. Replace{" "}
          <code>npm test --silent</code> with whatever runs your suite.
        </p>
        <CodeBlock label=".claude/hooks/run-tests.mjs">{RUN_TESTS}</CodeBlock>
        <p>
          The <code>stop_hook_active</code> check is the loop guard. Claude Code sets it to{" "}
          <code>true</code> when Claude is already continuing because a Stop hook blocked it. This
          version gives Claude one retry and then lets the turn end. Remove the check if you would
          rather rely on Claude Code’s built-in cap of 8 consecutive continuations.
        </p>
      </section>

      <section className="docs-section">
        <h2>Step 3: stop Claude from rewriting tests</h2>
        <p>
          A Stop hook alone has a loophole: the fastest way to make failing tests pass is to change
          the tests. Save this as <code>.claude/hooks/protect-tests.mjs</code>:
        </p>
        <CodeBlock label=".claude/hooks/protect-tests.mjs">{PROTECT_TESTS}</CodeBlock>
        <p>
          Claude can still add new test files, but any edit to an existing one is refused with an
          explanation. For why this matters, see{" "}
          <Link href={guidePath("ai-agent-changed-tests")}>
            why AI agents change tests to make them pass
          </Link>
          .
        </p>
      </section>

      <section className="docs-section">
        <h2>Limits of this setup</h2>
        <ul>
          <li>
            <strong>Running the full suite every turn is slow.</strong> On a large project, run only
            the tests related to the changed files, or the check becomes the thing everyone
            disables.
          </li>
          <li>
            <strong>Passing tests are only as good as the tests.</strong> If the existing tests do
            not check a behavior, the hook cannot protect it.{" "}
            <Link href={guidePath("mutation-testing-typescript")}>Mutation testing</Link> finds
            those gaps.
          </li>
          <li>
            <strong>The hook protects test files, not intent.</strong> Claude can still change a
            business rule in production code if no test covers it. Only a record of approved
            behavior outside the code catches that.
          </li>
          <li>
            <strong>Hooks run on the developer’s machine.</strong> Keep the same checks in CI so a
            change made without Claude Code, or with hooks disabled, is still verified.
          </li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>The MaruCheck version: verify against approved behavior</h2>
        <p>
          <Link href="/">MaruCheck</Link> ships a ready-made Stop hook that addresses those limits.
          Instead of running the whole suite, it runs <code>maru verify --diff</code>, which selects
          only the tests linked to requirements the change touches, checks the diff against your
          reviewed Quality Contracts for behavior drift, and blocks the turn with the exact failing
          requirement:
        </p>
        <CodeBlock>{`npm install --save-dev --save-exact ${cli.spec}
npx --no-install maru init
npx --no-install maru hook install`}</CodeBlock>
        <p>
          <code>maru hook install</code> merges one entry into <code>.claude/settings.json</code>{" "}
          and leaves your other hooks alone. When the gate blocks, Claude is told explicitly that
          editing or re-approving the contract is not an allowed fix. The{" "}
          <Link href="/docs/agent-gate">agent gate documentation</Link> shows the full output.
        </p>
      </section>

      <DocsCallout>
        <strong>Using Cursor or Codex instead?</strong>
        <p>
          The scripts above are plain Node.js. Run <code>run-tests.mjs</code> from a Git pre-push
          hook or a CI job, and enforce the test-file rule with a <code>CODEOWNERS</code> entry, so
          the same protection applies whichever agent wrote the change.
        </p>
      </DocsCallout>

      <GuideFooter
        related={[
          "ai-agent-changed-tests",
          "verify-ai-generated-code",
          "mutation-testing-typescript",
          "test-vibe-coded-app",
        ]}
        slug={SLUG}
      />
    </>
  );
}
