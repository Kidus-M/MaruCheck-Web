import Link from "next/link";
import { DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader, GuideTable } from "@/components/guides-shell";
import { guideMetadata, guidePath } from "@/lib/guides-registry";

const SLUG = "ai-code-review-tools-vs-verification";

export const metadata = guideMetadata(SLUG);

export default function ReviewToolsVsVerificationGuide() {
  return (
    <>
      <GuideHeader kicker="Guide / Tooling" slug={SLUG} />
      <GuideAnswer>
        AI code review tools read a pull request and comment on likely problems. Verification tools
        check the change against an independent record of required behavior and return pass or block
        evidence. Review finds issues in the diff; verification proves the product still keeps its
        promises. AI-generated code needs both, plus linters, security scanning, and tests that are
        themselves tested.
      </GuideAnswer>

      <section className="docs-section">
        <h2>The core difference: where the source of truth lives</h2>
        <p>
          Every quality tool compares the code to something. The useful question is <em>what</em>,
          and whether the AI that wrote the change could have changed it too.
        </p>
        <ul>
          <li>
            <strong>Linters and type checkers</strong> compare code to language and style rules.
          </li>
          <li>
            <strong>Security scanners</strong> compare code to known vulnerability patterns.
          </li>
          <li>
            <strong>AI review bots</strong> compare the diff to general programming knowledge and
            the surrounding code.
          </li>
          <li>
            <strong>Tests</strong> compare behavior to the expectations written in the test files,
            which an agent can edit in the same change.
          </li>
          <li>
            <strong>Independent verification</strong> compares behavior to a reviewed record of
            requirements that the agent cannot approve.
          </li>
        </ul>
        <p>
          Only the last kind can tell an intended rule change from an accidental one, because only
          the last kind knows what the rule was supposed to be.
        </p>
      </section>

      <section className="docs-section">
        <h2>What each layer catches and misses</h2>
        <GuideTable caption="Quality layers for AI-generated code compared">
          <thead>
            <tr>
              <th scope="col">Layer</th>
              <th scope="col">Examples</th>
              <th scope="col">Catches</th>
              <th scope="col">Misses</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Linters and type checking</th>
              <td>ESLint, TypeScript</td>
              <td>Type errors, unsafe patterns, unused code, some common bugs</td>
              <td>Logic errors and business rules</td>
            </tr>
            <tr>
              <th scope="row">Static security analysis</th>
              <td>CodeQL, Semgrep, Snyk Code</td>
              <td>Injection, XSS, hard-coded secrets, known vulnerable patterns</td>
              <td>App-specific authorization logic and business rules</td>
            </tr>
            <tr>
              <th scope="row">AI code review bots</th>
              <td>CodeRabbit, GitHub Copilot code review</td>
              <td>Likely bugs, missing error handling, readability, diff summaries</td>
              <td>Whether a behavior change was intended; shares the diff’s blind spots</td>
            </tr>
            <tr>
              <th scope="row">Code quality platforms</th>
              <td>SonarQube</td>
              <td>Maintainability, duplication, coverage thresholds, quality gates</td>
              <td>Whether tests assert the right behavior</td>
            </tr>
            <tr>
              <th scope="row">Automated tests</th>
              <td>Vitest, Jest, Playwright</td>
              <td>Regressions in the behavior the tests encode</td>
              <td>Anything, if the tests were rewritten in the same change</td>
            </tr>
            <tr>
              <th scope="row">Mutation testing</th>
              <td>StrykerJS</td>
              <td>Tests that run code without checking its results</td>
              <td>Requirements that have no test at all</td>
            </tr>
            <tr>
              <th scope="row">Independent verification</th>
              <td>MaruCheck</td>
              <td>
                Changes to approved behavior even when tests were updated to match, repeat
                regressions, weak tests on changed code
              </td>
              <td>Style and generic vulnerabilities; needs requirements written down first</td>
            </tr>
          </tbody>
        </GuideTable>
      </section>

      <section className="docs-section">
        <h2>Why AI review alone is not enough for AI-written code</h2>
        <p>
          AI review bots are good at what human reviewers find tedious: spotting a missing null
          check, an unhandled promise, or a confusing name across a large diff. Use them.
        </p>
        <p>
          But an AI reviewer and an AI coding agent are reading the same evidence. If the agent
          changed a free-plan limit from 5 to 10 and updated the test to match, the diff is
          internally consistent. The code is clean, the test passes, and nothing in the pull request
          says the old limit was a business decision. A reviewer, human or AI, that only sees the
          diff has no reason to object. Catching it requires a record of the approved limit that
          lives outside the change.
        </p>
      </section>

      <section className="docs-section">
        <h2>Which layers you need</h2>
        <GuideTable caption="Recommended layers by team situation">
          <thead>
            <tr>
              <th scope="col">Situation</th>
              <th scope="col">Start with</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Solo developer or vibe-coded app</th>
              <td>
                Type checking, end-to-end tests for your key promises, and a CI job that runs them.
                See <Link href={guidePath("test-vibe-coded-app")}>testing a vibe-coded app</Link>.
              </td>
            </tr>
            <tr>
              <th scope="row">Small team using coding agents daily</th>
              <td>
                All of the above, plus an AI review bot as a first pass, protected test files, and
                independent verification on critical paths.
              </td>
            </tr>
            <tr>
              <th scope="row">Billing, health, finance, or regulated data</th>
              <td>
                Every layer, with mutation checks on critical code and a recorded human approval for
                any change to required behavior.
              </td>
            </tr>
          </tbody>
        </GuideTable>
      </section>

      <section className="docs-section">
        <h2>Four questions to ask any AI code quality tool</h2>
        <ol>
          <li>
            <strong>What does it compare the code to?</strong> If the answer is only the diff, it
            cannot detect an intended-looking but unapproved change.
          </li>
          <li>
            <strong>Can the coding agent change that reference?</strong> If the agent can edit the
            tests or the config the tool relies on, the check is not independent.
          </li>
          <li>
            <strong>Does it produce evidence or opinions?</strong> A comment saying a change “looks
            fine” is not the same as a reproducible test result tied to a requirement.
          </li>
          <li>
            <strong>Where does it run, and what leaves your network?</strong> Some tools upload
            source code to a hosted service; others run entirely in your own CI.
          </li>
        </ol>
      </section>

      <DocsCallout>
        <strong>Where MaruCheck fits.</strong>
        <p>
          <Link href="/">MaruCheck</Link> is the independent-verification layer, not a review bot.
          It is a free, MIT-licensed CLI for JavaScript and TypeScript projects that checks each Git
          diff against reviewed Quality Contracts, runs the linked Vitest, Jest, or Playwright
          tests, flags behavior drift, recalls past regressions, and returns a ship-or-block
          decision. It runs locally or in your CI, so no source code is uploaded. Use it alongside a
          review bot, not instead of one. Read the{" "}
          <Link href={guidePath("verify-ai-generated-code")}>verification process</Link> or{" "}
          <Link href="/docs/getting-started">try it in five minutes</Link>.
        </p>
      </DocsCallout>

      <GuideFooter
        related={[
          "verify-ai-generated-code",
          "review-ai-generated-pull-requests",
          "mutation-testing-typescript",
          "ai-agent-changed-tests",
        ]}
        slug={SLUG}
      />
    </>
  );
}
