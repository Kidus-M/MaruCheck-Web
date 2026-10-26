import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader, GuideTable } from "@/components/guides-shell";
import { GUIDES, guideMetadata, guidePath } from "@/lib/guides-registry";
import type { HowToStep } from "@/lib/structured-data";
import { howToSchema } from "@/lib/structured-data";
import { fetchCliRelease } from "@/lib/cli-release";

const SLUG = "verify-ai-generated-code";

export const metadata = guideMetadata(SLUG);

const steps: readonly HowToStep[] = [
  {
    name: "Write down what must not change",
    text: "Record the approved behavior the change has to preserve in a reviewed file that lives outside the test suite, so the AI cannot redefine correct by editing tests.",
  },
  {
    name: "Read the test diff before the code diff",
    text: "Check whether the change edited, weakened, skipped, or deleted tests. A changed expected value is a behavior decision a human has to confirm.",
  },
  {
    name: "Scale verification to risk",
    text: "Spend the most effort on changes that touch authentication, authorization, billing, data deletion, migrations, or shared libraries.",
  },
  {
    name: "Run targeted tests outside the agent",
    text: "Run the tests linked to the affected requirements in CI or a hook the agent cannot skip, and record the result.",
  },
  {
    name: "Test the tests",
    text: "Use mutation testing to confirm the relevant tests fail when the behavior they protect is deliberately broken.",
  },
  {
    name: "Keep the evidence and make the decision explicit",
    text: "Attach test output and any approved behavior change to the pull request so a reviewer can audit why it shipped.",
  },
];

export default async function VerifyAiGeneratedCodeGuide() {
  const cli = await fetchCliRelease();
  return (
    <>
      <GuideHeader kicker="Guide / Verification" slug={SLUG} />
      <GuideAnswer>
        To verify AI-generated code, check it against a statement of required behavior that the AI
        could not edit. Keep that statement outside the test suite, review test changes before code
        changes, focus effort on high-risk paths, run the relevant tests where the agent cannot skip
        them, confirm those tests really fail when the behavior breaks, and keep the evidence with
        the change.
      </GuideAnswer>

      <section className="docs-section">
        <h2>Why AI-generated code needs a different kind of check</h2>
        <p>
          Traditional review assumes the tests were written by someone other than the person who
          changed the code, or at least at a different time. AI coding agents break that assumption.
          Claude Code, Cursor, Copilot’s agent mode, and Codex can all edit the implementation and
          the tests that judge it in a single change. When they do, a green test run proves only
          that the code agrees with its own tests.
        </p>
        <p>The research so far points in the same direction:</p>
        <ul>
          <li>
            Google’s{" "}
            <a href="https://dora.dev/research/2024/dora-report/" rel="noreferrer" target="_blank">
              2024 DORA report
            </a>{" "}
            estimated that every 25% increase in AI adoption was associated with a 7.2% decrease in
            software delivery stability, even as code review speed and documentation improved.
          </li>
          <li>
            In the{" "}
            <a href="https://survey.stackoverflow.co/2025/ai" rel="noreferrer" target="_blank">
              2025 Stack Overflow Developer Survey
            </a>
            , more developers said they distrust the accuracy of AI tools (46%) than trust it (33%),
            and 66% named “AI solutions that are almost right, but not quite” as their top
            frustration.
          </li>
          <li>
            Veracode’s{" "}
            <a
              href="https://www.veracode.com/resources/genai-code-security-report/"
              rel="noreferrer"
              target="_blank"
            >
              2025 GenAI Code Security Report
            </a>{" "}
            tested more than 100 language models on 80 coding tasks and found security
            vulnerabilities in 45% of cases.
          </li>
        </ul>
        <p>
          “Almost right” is the core problem. Code that is obviously broken gets caught. Code that
          compiles, passes its tests, and quietly changes a business rule does not, unless something
          independent of the AI knows what the rule was supposed to be.
        </p>
      </section>

      <section className="docs-section">
        <h2>How to verify AI-generated code in six steps</h2>
        <p>
          This process works with any language, test framework, or coding assistant. The tools only
          change how much of it is automated.
        </p>

        <h3 id="step-1">1. Write down what must not change</h3>
        <p>
          Before you can check whether an AI broke something, you need a record of what “working”
          means that the AI cannot quietly rewrite. Tests are a poor place for that record when the
          same agent edits them. Keep a short, reviewed list of the behaviors that matter, such as{" "}
          <em>“free-plan users can create at most 5 projects”</em> or{" "}
          <em>“users can only read invoices that belong to their own account”</em>, in a file that
          needs a human owner to approve changes.
        </p>
        <p>
          Five to twenty statements are enough for most products. Give each one a stable ID so tests
          and pull requests can refer to it.
        </p>

        <h3 id="step-2">2. Read the test diff before the code diff</h3>
        <p>
          If a change that was supposed to fix or add a feature also modifies existing tests, review
          those test edits first. A changed expected value, a deleted test case, a new{" "}
          <code>.skip</code>, or a mock that replaces the code under test is the AI deciding what
          correct behavior is. That is the decision a human most needs to confirm. Our guide on{" "}
          <Link href={guidePath("ai-agent-changed-tests")}>
            why agents change tests to make them pass
          </Link>{" "}
          lists the patterns to look for.
        </p>

        <h3 id="step-3">3. Scale verification to risk</h3>
        <p>
          Not every AI-generated change deserves the same scrutiny. A copy change to a marketing
          page and a change to the authorization middleware are different risks. Rank the change by
          what it touches, not by how many lines it has:
        </p>
        <GuideTable caption="Minimum verification by risk level">
          <thead>
            <tr>
              <th scope="col">Risk</th>
              <th scope="col">Typical AI changes</th>
              <th scope="col">Minimum check</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Critical</th>
              <td>Auth, permissions, billing, data deletion, migrations, secrets</td>
              <td>Human review of every line, requirement-linked tests, mutation check, CI gate</td>
            </tr>
            <tr>
              <th scope="row">High</th>
              <td>Business rules, shared utilities, API contracts, input validation</td>
              <td>Targeted tests for affected requirements, test-diff review, CI gate</td>
            </tr>
            <tr>
              <th scope="row">Medium</th>
              <td>New features behind existing boundaries, UI state logic</td>
              <td>Relevant unit and end-to-end tests, normal review</td>
            </tr>
            <tr>
              <th scope="row">Low</th>
              <td>Copy, styles, docs, isolated refactors with unchanged tests</td>
              <td>Type check, lint, existing suite</td>
            </tr>
          </tbody>
        </GuideTable>

        <h3 id="step-4">4. Run targeted tests outside the agent</h3>
        <p>
          The agent saying “all tests pass” is not evidence. Run the tests yourself, or better, run
          them somewhere the agent cannot skip: a CI job on the pull request, or a hook that runs
          before the agent can finish. Prioritize the tests linked to the requirements the change
          could affect. If you use Claude Code,{" "}
          <Link href={guidePath("claude-code-hooks-run-tests")}>a Stop hook</Link> can refuse to let
          a turn end while tests are failing.
        </p>

        <h3 id="step-5">5. Test the tests</h3>
        <p>
          AI-written tests often execute code without asserting what it should do. Coverage reports
          count those tests as protection. Mutation testing does not: it deliberately breaks the
          code, for example by flipping a comparison or deleting a guard, and checks that at least
          one test fails. A test that keeps passing against broken code is not protecting anything.
          See{" "}
          <Link href={guidePath("mutation-testing-typescript")}>
            mutation testing in TypeScript and JavaScript
          </Link>{" "}
          for a walkthrough.
        </p>

        <h3 id="step-6">6. Keep the evidence and make the decision explicit</h3>
        <p>
          A release decision should be auditable later. Keep the test output, the list of
          requirements that were checked, and, when behavior genuinely changed, the name of the
          person who approved the new behavior. When something breaks in production, that record
          tells you whether the check was missing, wrong, or skipped.
        </p>
      </section>

      <section className="docs-section">
        <h2>A checklist for your pull request template</h2>
        <p>Paste this into your pull request template for any change written mostly by an AI:</p>
        <CodeBlock label="Pull request template">{`## AI-generated change checklist
- [ ] Requirements this change touches are listed (IDs or links)
- [ ] Test changes reviewed before implementation changes
- [ ] No expected values changed without an approved behavior change
- [ ] No tests skipped, deleted, or replaced with mocks of the code under test
- [ ] Auth, billing, and data-access paths reviewed line by line
- [ ] Targeted tests ran in CI (link to run)
- [ ] Mutation check run for critical paths (link to report)
- [ ] Behavior changes approved by: @owner`}</CodeBlock>
      </section>

      <section className="docs-section">
        <h2>Automating the process with MaruCheck</h2>
        <p>
          Everything above can be done by hand. MaruCheck is a free, open-source CLI that automates
          it for JavaScript and TypeScript repositories. It runs locally or in your CI runner, so no
          source code is uploaded. Each step maps to a command:
        </p>
        <GuideTable caption="Verification steps mapped to MaruCheck commands">
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Command</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Record what must not change</th>
              <td>
                <code>maru contract create --from requirements.md</code>, then{" "}
                <code>maru contract approve</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Score the diff’s risk</th>
              <td>
                <code>maru risk --diff</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Build a requirement-linked test plan</th>
              <td>
                <code>maru plan --diff</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Run targeted tests and detect behavior drift</th>
              <td>
                <code>maru verify --diff</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Test the tests</th>
              <td>
                <code>maru mutate --diff</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Gate every pull request</th>
              <td>
                <code>maru ci init</code>
              </td>
            </tr>
          </tbody>
        </GuideTable>
        <DocsCallout>
          <strong>The agent can run the check, but it cannot approve itself.</strong>
          <p>
            Coding agents can call MaruCheck through its <Link href="/docs/mcp">MCP server</Link>,
            but approving a changed behavior always requires a named human owner. Start with the{" "}
            <Link href="/docs/getting-started">five-minute getting started guide</Link>.
          </p>
        </DocsCallout>
      </section>

      <GuideFooter
        extraNodes={[
          howToSchema({
            cliVersion: cli.version,
            description: GUIDES[SLUG].description,
            name: GUIDES[SLUG].heading,
            path: guidePath(SLUG),
            steps,
            totalTime: "PT30M",
          }),
        ]}
        related={[
          "ai-agent-changed-tests",
          "review-ai-generated-pull-requests",
          "mutation-testing-typescript",
          "ai-code-review-tools-vs-verification",
        ]}
        slug={SLUG}
      />
    </>
  );
}
