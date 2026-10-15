import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader, GuideTable } from "@/components/guides-shell";
import { guideMetadata, guidePath } from "@/lib/guides-registry";

const SLUG = "mutation-testing-typescript";

export const metadata = guideMetadata(SLUG);

export default function MutationTestingGuide() {
  return (
    <>
      <GuideHeader kicker="Guide / Test quality" slug={SLUG} />
      <GuideAnswer>
        Mutation testing checks whether your tests actually catch bugs. A tool makes small
        deliberate changes to your code, such as turning <code>&lt;</code> into <code>&lt;=</code>{" "}
        or deleting a guard, then reruns the tests. If a test fails, the mutant is killed. If every
        test still passes, that behavior is not really tested, whatever your coverage report says.
      </GuideAnswer>

      <section className="docs-section">
        <h2>Why 100% coverage can still mean untested</h2>
        <p>
          Coverage measures which lines ran during the tests, not whether the tests checked the
          result. That gap matters more now, because AI coding agents are very good at producing
          tests that execute code and very inconsistent at asserting what it should do.
        </p>
        <p>Here is a small function and the kind of test an agent often writes for it:</p>
        <CodeBlock label="src/projects.ts">{`export function canCreateProject(plan: "free" | "pro", existing: number): boolean {
  if (plan === "pro") return true;
  return existing < 5;
}`}</CodeBlock>
        <CodeBlock label="src/projects.test.ts">{`it("enforces the free plan limit", () => {
  expect(canCreateProject("free", 2)).toBe(true);
  expect(canCreateProject("pro", 50)).toBe(true);
});`}</CodeBlock>
        <p>
          Every line and both branches run, so coverage reports 100%. But the test never checks the
          one thing its name promises: that a free user with five projects is refused. Change{" "}
          <code>existing &lt; 5</code> to <code>existing &lt;= 5</code>, or to <code>true</code>,
          and the test still passes.
        </p>
      </section>

      <section className="docs-section">
        <h2>How mutation testing works</h2>
        <ol>
          <li>The tool parses your source and finds places it can make a small change.</li>
          <li>
            Each change produces a <strong>mutant</strong>: a copy of the program with one
            deliberate bug.
          </li>
          <li>The tests run against each mutant.</li>
          <li>
            A mutant that makes at least one test fail is <strong>killed</strong>. A mutant that
            every test tolerates <strong>survived</strong>.
          </li>
        </ol>
        <GuideTable caption="Common mutation operators">
          <thead>
            <tr>
              <th scope="col">Operator</th>
              <th scope="col">Example</th>
              <th scope="col">What a survivor tells you</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Comparison</th>
              <td>
                <code>&lt;</code> → <code>&lt;=</code>, <code>===</code> → <code>!==</code>
              </td>
              <td>No test checks the boundary value</td>
            </tr>
            <tr>
              <th scope="row">Boolean</th>
              <td>
                <code>true</code> → <code>false</code>
              </td>
              <td>The flag’s effect is never asserted</td>
            </tr>
            <tr>
              <th scope="row">Conditional</th>
              <td>
                <code>if (isOwner)</code> → <code>if (true)</code>
              </td>
              <td>Nothing tests the case where the condition is false</td>
            </tr>
            <tr>
              <th scope="row">Block removal</th>
              <td>An early return or throw is deleted</td>
              <td>The guard can disappear without any test noticing</td>
            </tr>
            <tr>
              <th scope="row">Arithmetic</th>
              <td>
                <code>+</code> → <code>-</code>
              </td>
              <td>The calculated value is not checked</td>
            </tr>
          </tbody>
        </GuideTable>
      </section>

      <section className="docs-section">
        <h2>How to read a mutation score</h2>
        <p>
          The mutation score is the share of mutants your tests detected. In StrykerJS’s{" "}
          <a
            href="https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/"
            rel="noreferrer"
            target="_blank"
          >
            definition
          </a>
          , detected mutants are those killed or timed out, and the score is detected divided by
          detected plus undetected (survived or not covered by any test). Mutants that fail to
          compile or crash the runner are excluded.
        </p>
        <p>
          StrykerJS’s default thresholds treat 80% or more as high and below 60% as low, and do not
          fail the build unless you set a <code>break</code> threshold. The number matters less than
          the list of survivors. Each surviving mutant points at a specific line and a specific
          missing assertion, which is far more actionable than a coverage percentage.
        </p>
      </section>

      <section className="docs-section">
        <h2>Running StrykerJS with Vitest or Jest</h2>
        <p>
          <a href="https://stryker-mutator.io/" rel="noreferrer" target="_blank">
            StrykerJS
          </a>{" "}
          is the most widely used mutation testing framework for JavaScript and TypeScript. Its
          setup wizard detects your test runner and installs the matching plugin:
        </p>
        <CodeBlock>{`npm init stryker@latest
npx stryker run`}</CodeBlock>
        <p>A minimal configuration for a Vitest project looks like this:</p>
        <CodeBlock label="stryker.config.json">{`{
  "testRunner": "vitest",
  "mutate": ["src/**/*.ts", "!src/**/*.test.ts"],
  "incremental": true,
  "thresholds": { "high": 80, "low": 60, "break": 60 }
}`}</CodeBlock>
        <p>
          <code>incremental</code> reuses results for code that has not changed, which makes
          repeated runs much faster. Setting <code>break</code> fails the run when the score drops
          below that value.
        </p>
      </section>

      <section className="docs-section">
        <h2>Mutation testing only what the AI changed</h2>
        <p>
          A full mutation run on a large codebase can take a long time, because every mutant reruns
          tests. For AI-generated changes, you usually only need to know whether the tests protect
          the code that just changed. Pass Stryker the changed files:
        </p>
        <CodeBlock>{`CHANGED=$(git diff --name-only main...HEAD -- 'src/*.ts' ':!*.test.ts' | paste -sd, -)
[ -n "$CHANGED" ] && npx stryker run --mutate "$CHANGED"`}</CodeBlock>
        <p>
          <Link href="/">MaruCheck</Link> builds this in. <code>maru mutate --diff</code> finds
          mutation candidates only in the changed TypeScript files, runs only the tests linked to
          the affected requirements, and works in a temporary Git worktree so your checkout is never
          modified. It focuses on the mutations that matter most in AI-written changes: inverted
          booleans, changed comparisons, removed guards, and removed ownership or permission
          conditions.
        </p>
        <CodeBlock>{`npx --no-install maru mutate --diff --max 8`}</CodeBlock>
        <p>
          The unmodified code has to pass first; otherwise the run is reported as inconclusive
          rather than blaming a mutant. Any survivor is reported as{" "}
          <code>WEAK VERIFICATION DETECTED</code> and blocks the release, with the mutated line and
          the tests that missed it. See the <Link href="/docs/cli">CLI reference</Link> for every
          option.
        </p>
      </section>

      <DocsCallout>
        <strong>Fixing the example.</strong>
        <p>
          Two assertions kill both surviving mutants: <code>{`canCreateProject("free", 4)`}</code>{" "}
          must be <code>true</code> and <code>{`canCreateProject("free", 5)`}</code> must be{" "}
          <code>false</code>. Boundary tests like these are what AI-written suites most often leave
          out, and what mutation testing finds first.
        </p>
      </DocsCallout>

      <section className="docs-section">
        <h2>When to use mutation testing</h2>
        <ul>
          <li>On critical paths such as authorization, billing, and quotas, on every change.</li>
          <li>When an AI agent wrote both the implementation and its tests.</li>
          <li>
            After an agent edited existing tests. Weakened assertions show up immediately as new
            survivors. See{" "}
            <Link href={guidePath("ai-agent-changed-tests")}>
              how agents change tests to make them pass
            </Link>
            .
          </li>
          <li>Before trusting a coverage number in a release decision.</li>
        </ul>
      </section>

      <GuideFooter
        related={[
          "verify-ai-generated-code",
          "ai-agent-changed-tests",
          "claude-code-hooks-run-tests",
          "ai-code-review-tools-vs-verification",
        ]}
        slug={SLUG}
      />
    </>
  );
}
