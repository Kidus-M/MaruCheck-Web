# Starter issues

Scoped tasks with acceptance criteria and the files each one touches. Comment on the matching
GitHub issue before starting so two people do not pick up the same one. Most of these need no
database — see [how much needs a database](../../CONTRIBUTING.md#how-much-needs-a-database).

- [`good first issue`](#good-first-issue)
  - [Add an empty state to every dashboard list](#add-an-empty-state-to-every-dashboard-list)
  - [Make the docs pages linkable and searchable](#make-the-docs-pages-linkable-and-searchable)
  - [Show the verification gate in the browser tab](#show-the-verification-gate-in-the-browser-tab)
- [`help wanted`](#help-wanted)
  - [An accessibility audit of the dashboard](#an-accessibility-audit-of-the-dashboard)
  - [A public status and changelog page](#a-public-status-and-changelog-page)
  - [Ingestion API client examples](#ingestion-api-client-examples)

## `good first issue`

### Add an empty state to every dashboard list

**Why.** A new project has no runs, no findings, and no QA memory. An empty table teaches nothing;
an empty state can teach the next command to run.

**Where.** `src/app/(dashboard)/runs`, `findings`, `coverage`, `memory`, `contracts`, and the shared
components in `src/components`.

**Acceptance criteria.**

- Every dashboard list renders a purposeful empty state rather than an empty table.
- Each one names the exact CLI command that produces the missing data, for example
  `maru verify --diff` followed by `maru upload`.
- The empty state is server-rendered and needs no client island.
- Copy is consistent across pages, and the pattern is documented next to the shared component.

### Make the docs pages linkable and searchable

**Why.** `/docs` pages are the landing point for people arriving from the CLI, and a heading you
cannot link to is a heading nobody shares.

**Where.** `src/app/(marketing)/docs`.

**Acceptance criteria.**

- Every `h2` and `h3` has a stable anchor id and a visible-on-focus anchor link.
- A page-level table of contents is rendered for documents above a threshold length.
- Anchors are keyboard reachable and announced sensibly by a screen reader.
- No client-side JavaScript is required to use them.

### Show the verification gate in the browser tab

**Why.** People keep a run open while it finishes. The tab title should say what happened.

**Where.** `generateMetadata` in the run detail route under `src/app/(dashboard)/runs`.

**Acceptance criteria.**

- The run page title includes the gate status and the project name, for example
  `BLOCKED · checkout-api · run 1284`.
- Titles stay stable across a refresh and are correct for passed, blocked, and in-progress runs.
- No layout or client component changes are needed.

## `help wanted`

### An accessibility audit of the dashboard

**Why.** The CLI ships an axe adapter and selects accessibility suites for UI changes. The
dashboard should be able to survive its own product's standard.

**Where.** `tests/e2e`, plus whatever the audit finds under `src/app/(dashboard)`.

**Acceptance criteria.**

- An axe-backed Playwright spec covers the main dashboard routes at desktop and mobile viewports.
- Violations are either fixed or recorded with a rationale and a follow-up issue.
- Keyboard-only navigation reaches every interactive element, focus order matches visual order, and
  focus is never trapped.
- The spec runs in `npm run test:e2e` without a special setup step.

### A public status and changelog page

**Why.** Someone deciding whether to send reports to a hosted service wants to see uptime history
and what changed, without signing in.

**Where.** A new route under `src/app/(marketing)`, reading from `/api/health/ready` history and a
committed changelog file.

**Acceptance criteria.**

- The page renders without authentication and without a database connection.
- It shows the current readiness state and a dated list of releases.
- The changelog source is a file in the repository, not a database table.
- The page is cached and does not add a per-request database query to the marketing site.

### Ingestion API client examples

**Why.** `POST /api/v1/ingest/runs` and `POST /api/v1/production-events` are documented, but
teams on GitLab, CircleCI, or a bespoke pipeline still write the request by hand.

**Where.** `docs/api/`, alongside the existing [OpenAPI document](../api/openapi-v1.yaml).

**Acceptance criteria.**

- Working examples in at least curl, TypeScript, and Python.
- Each one shows token handling that keeps the token out of logs and shell history.
- Each one shows the retry and failure behavior a CI job should have.
- Examples are verified against the OpenAPI document rather than written from memory.
