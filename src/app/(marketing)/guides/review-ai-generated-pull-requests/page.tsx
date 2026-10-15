import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader, GuideTable } from "@/components/guides-shell";
import { guideMetadata, guidePath } from "@/lib/guides-registry";

const SLUG = "review-ai-generated-pull-requests";

export const metadata = guideMetadata(SLUG);

export default function ReviewAiPullRequestsGuide() {
  return (
    <>
      <GuideHeader kicker="Guide / Code review" slug={SLUG} />
      <GuideAnswer>
        Review an AI-generated pull request starting from the requirement, not the diff. Restate
        what behavior should change, review test edits before code edits, read every removed guard,
        check trust boundaries such as authorization and input validation by hand, confirm new
        dependencies exist, and approve on reproducible evidence rather than the agent’s summary.
      </GuideAnswer>

      <section className="docs-section">
        <h2>What’s different about reviewing AI-written code</h2>
        <p>
          Reviewing a colleague’s pull request relies on things that do not hold for a coding agent.
          A colleague usually knows the product rules, writes tests separately from the fix, and
          tells you when they are unsure. An agent produces more code, faster, in a uniformly
          confident style, and its pull request description is a claim about what it did, not
          evidence that it did it.
        </p>
        <p>Three habits change as a result:</p>
        <ul>
          <li>
            <strong>Read what was removed as carefully as what was added.</strong> Agents simplify
            aggressively, and a deleted line is often a deleted safety check.
          </li>
          <li>
            <strong>Treat test changes as behavior changes.</strong> If the tests moved, the
            definition of correct moved with them.
          </li>
          <li>
            <strong>Verify, don’t trust, the summary.</strong> “All tests pass” and “no breaking
            changes” are statements to check, not conclusions to accept.
          </li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>The review order that catches the most</h2>
        <ol>
          <li>
            <strong>Restate the intent.</strong> In one sentence, write what behavior this pull
            request should change and what it must not change. If you cannot, the agent could not
            either.
          </li>
          <li>
            <strong>Review the tests first.</strong> Look for changed expected values, weakened
            assertions, new skips, deleted cases, and mocks of the code under test. See{" "}
            <Link href={guidePath("ai-agent-changed-tests")}>
              how agents change tests to make them pass
            </Link>
            .
          </li>
          <li>
            <strong>Read every deletion.</strong> Removed <code>if</code> statements, early returns,{" "}
            <code>throw</code>s, and <code>where</code> clauses deserve a reason.
          </li>
          <li>
            <strong>Check trust boundaries by hand.</strong> Authentication, ownership and tenant
            checks, permission logic, input validation, and anything that touches secrets.
          </li>
          <li>
            <strong>Confirm new dependencies are real.</strong> A{" "}
            <a href="https://arxiv.org/abs/2406.10279" rel="noreferrer" target="_blank">
              study of 16 code-generating models
            </a>{" "}
            found average hallucinated-package rates of at least 5.2% for commercial models and
            21.7% for open-source models. Attackers register those invented names, a technique
            called slopsquatting.
          </li>
          <li>
            <strong>Require evidence.</strong> A link to a CI run of the relevant tests, and for
            critical paths, a mutation report showing those tests catch real breakage.
          </li>
        </ol>
      </section>

      <section className="docs-section">
        <h2>Failure patterns that look correct</h2>
        <p>
          These pass a quick read because the code is clean and idiomatic. They are wrong because of
          what the code no longer does.
        </p>
        <GuideTable caption="Common AI pull request defects and how to catch them">
          <thead>
            <tr>
              <th scope="col">Pattern</th>
              <th scope="col">Why it slips through</th>
              <th scope="col">What to check</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Dropped ownership check</th>
              <td>A query by ID still returns the right record in every happy-path test.</td>
              <td>Does every lookup still filter by the current user, account, or tenant?</td>
            </tr>
            <tr>
              <th scope="row">Boundary shift</th>
              <td>
                <code>&lt;</code> becoming <code>&lt;=</code> changes one edge case no test covers.
              </td>
              <td>Limits, quotas, pagination, and date ranges at exactly the boundary value.</td>
            </tr>
            <tr>
              <th scope="row">Silent fallback</th>
              <td>A catch block returning an empty list makes errors look like “no data”.</td>
              <td>Every new try/catch: is the failure logged, surfaced, or hidden?</td>
            </tr>
            <tr>
              <th scope="row">Invented option</th>
              <td>A plausible config flag or API parameter that the library silently ignores.</td>
              <td>Look up any unfamiliar option in the library’s actual documentation.</td>
            </tr>
            <tr>
              <th scope="row">Scope creep</th>
              <td>
                A “small fix” that reformats or refactors unrelated files hides the real change.
              </td>
              <td>Ask for unrelated changes to be split out before reviewing.</td>
            </tr>
            <tr>
              <th scope="row">Quiet rule change</th>
              <td>A business constant changes, and its test is updated to match.</td>
              <td>Compare against the written requirement, not against the updated test.</td>
            </tr>
          </tbody>
        </GuideTable>
      </section>

      <section className="docs-section">
        <h2>A reviewer checklist</h2>
        <CodeBlock label="Review checklist">{`[ ] I can state in one sentence what behavior this PR changes
[ ] Test diffs reviewed first; no unexplained expected-value changes
[ ] No new .skip / .only / deleted test cases
[ ] Every removed guard, condition, or throw has a reason
[ ] Auth, ownership, and permission checks still apply on every path
[ ] New dependencies exist, are maintained, and are the intended package
[ ] Unfamiliar APIs and options checked against real documentation
[ ] Relevant tests ran in CI (not just "the agent said so")
[ ] Critical paths have a mutation check or equivalent evidence
[ ] Any intended behavior change is approved by its owner`}</CodeBlock>
      </section>

      <section className="docs-section">
        <h2>Where AI review bots and verification fit</h2>
        <p>
          AI code review bots are a useful first pass. They catch typos, obvious bugs, and missing
          error handling quickly. But they read the same diff the coding agent produced and have no
          record of what the product promised, so they cannot tell an intended rule change from an
          accidental one. The{" "}
          <Link href={guidePath("ai-code-review-tools-vs-verification")}>
            comparison of review tools and verification
          </Link>{" "}
          covers which layer catches what.
        </p>
        <p>
          For the parts of this checklist that can be automated, <Link href="/">MaruCheck</Link>{" "}
          checks the diff against reviewed requirements, runs only the linked tests, detects
          behavior drift, runs mutation checks on changed code, and posts a ship-or-block decision
          from a <Link href="/docs/ci">least-privilege GitHub Actions workflow</Link>. The reviewer
          still owns the decision; the evidence just arrives with the pull request.
        </p>
      </section>

      <DocsCallout>
        <strong>Big AI pull requests are a review smell.</strong>
        <p>
          If an agent produced a 2,000-line pull request, the fastest review is usually to ask for
          it in smaller, single-purpose pieces. Reviewers catch far more in short diffs, and agents
          are good at splitting work when asked.
        </p>
      </DocsCallout>

      <GuideFooter
        related={[
          "verify-ai-generated-code",
          "ai-agent-changed-tests",
          "ai-code-review-tools-vs-verification",
          "mutation-testing-typescript",
        ]}
        slug={SLUG}
      />
    </>
  );
}
