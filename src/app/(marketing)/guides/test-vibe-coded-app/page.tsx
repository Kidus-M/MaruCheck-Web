import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { GuideAnswer, GuideFooter, GuideHeader } from "@/components/guides-shell";
import { guideMetadata, guidePath } from "@/lib/guides-registry";

const SLUG = "test-vibe-coded-app";

export const metadata = guideMetadata(SLUG);

export default function TestVibeCodedAppGuide() {
  return (
    <>
      <GuideHeader kicker="Guide / Vibe coding" slug={SLUG} />
      <GuideAnswer>
        To test a vibe-coded app, write down the five to ten things it must never get wrong, such as
        sign-in, payments, permissions, and deleting data. Cover each with one end-to-end test,
        break each feature on purpose to prove its test notices, then run those tests automatically
        on every change your AI makes.
      </GuideAnswer>

      <section className="docs-section">
        <h2>Why vibe-coded apps need a different safety net</h2>
        <p>
          Vibe coding, a term Andrej Karpathy coined in February 2025, means building software by
          describing what you want to an AI and accepting the result without reading every line. It
          is a genuinely fast way to get from idea to working app. The catch is that nothing in the
          loop remembers what “working” meant last week.
        </p>
        <p>
          Every new prompt can change code you did not ask the AI to touch. A quick click-through
          shows the new feature works; it does not show that the old features still do, or that one
          user cannot see another user’s data. Those are the failures that reach production.
        </p>
      </section>

      <section className="docs-section">
        <h2>What usually breaks</h2>
        <ul>
          <li>
            <strong>Access control.</strong> Pages and API routes that check you are signed in, but
            not that the record you asked for is yours.
          </li>
          <li>
            <strong>Data leaking between accounts.</strong> A query that forgets to filter by user
            or team, or a database table with row-level security switched off.
          </li>
          <li>
            <strong>Secrets in the browser.</strong> API keys that end up in client-side code
            because the AI put a server call in a component.
          </li>
          <li>
            <strong>Money and limits.</strong> Free-plan limits, trial expiry, and webhook handling
            for payments, which are easy to get almost right.
          </li>
          <li>
            <strong>Silent regressions.</strong> A feature that worked last week and stopped after
            an unrelated prompt changed shared code.
          </li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>The one-afternoon testing plan</h2>

        <h3>1. Write down your app’s promises</h3>
        <p>
          In plain English, list the five to ten things that would be a disaster if they broke. For
          a typical SaaS app:
        </p>
        <CodeBlock label="promises.md">{`P-1  Only signed-in users can see the dashboard.
P-2  A user can only see and edit their own projects.
P-3  Free-plan users can create at most 3 projects.
P-4  Checkout upgrades the account only after payment succeeds.
P-5  Deleting an account deletes that user's data and nobody else's.
P-6  No API key or secret appears in the browser.`}</CodeBlock>
        <p>
          This list is the most valuable artifact in the whole process. It is the definition of
          “working” that does not change just because the code did.
        </p>

        <h3>2. Write one end-to-end test per promise</h3>
        <p>
          End-to-end tests drive a real browser through your app, so they test what users actually
          experience rather than how the AI happened to structure the code.{" "}
          <a href="https://playwright.dev/" rel="noreferrer" target="_blank">
            Playwright
          </a>{" "}
          is a good default. You can ask your AI to write these tests; the next step is how you
          check them.
        </p>
        <CodeBlock label="tests/access.spec.ts">{`import { test, expect } from "@playwright/test";

// P-2: A user can only see and edit their own projects.
test("a user cannot open another user's project", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel("Password").fill(process.env.ALICE_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();

  // A project ID that belongs to Bob in your test seed data.
  const response = await page.goto("/projects/proj_bob_001");
  expect(response?.status()).toBe(404);
});`}</CodeBlock>

        <h3>3. Break each feature on purpose</h3>
        <p>
          A test the AI wrote might pass for the wrong reason. For each promise, temporarily break
          the feature, for example by commenting out the ownership check, and run the test. If it
          still passes, the test is not protecting anything. This is a manual form of{" "}
          <Link href={guidePath("mutation-testing-typescript")}>mutation testing</Link>, and it is
          the step most people skip.
        </p>

        <h3>4. Check the security basics</h3>
        <ul>
          <li>Search the built client bundle for your API key prefixes.</li>
          <li>If you use Supabase or another hosted database, confirm row-level security is on.</li>
          <li>
            Every server route that returns data checks who is asking, not just that someone is.
          </li>
          <li>Payment webhooks verify the provider’s signature.</li>
        </ul>

        <h3>5. Run the tests on every change</h3>
        <p>
          Tests nobody runs protect nothing. A GitHub Actions workflow runs them on every push and
          pull request, including the ones your AI makes:
        </p>
        <CodeBlock label=".github/workflows/tests.yml">{`name: tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test`}</CodeBlock>
        <p>
          Configure Playwright’s <code>webServer</code> option so it starts your app before the
          tests run.
        </p>

        <h3>6. Stop the AI from quietly changing the rules</h3>
        <p>
          The last gap: when a test fails, an AI agent will often “fix” it by changing the test.
          Change promise P-3 from 3 projects to 10 in both the code and the test, and everything
          stays green. See{" "}
          <Link href={guidePath("ai-agent-changed-tests")}>
            why AI agents change tests to make them pass
          </Link>{" "}
          for the patterns and the fixes.
        </p>
      </section>

      <DocsCallout>
        <strong>Turning promises.md into a release gate.</strong>
        <p>
          <Link href="/">MaruCheck</Link> is a free, open-source tool built for this. Your promises
          become reviewed <Link href="/docs/quality-contracts">Quality Contracts</Link> with an
          owner, every AI change is checked against them, and a change that alters a promise is
          blocked until you approve it, even if the AI updated the tests to match. The{" "}
          <Link href="/docs/getting-started">getting started guide</Link> takes about five minutes.
        </p>
      </DocsCallout>

      <GuideFooter
        related={[
          "verify-ai-generated-code",
          "ai-agent-changed-tests",
          "claude-code-hooks-run-tests",
          "review-ai-generated-pull-requests",
        ]}
        slug={SLUG}
      />
    </>
  );
}
