# Contributing to MaruCheck Web

This repository is the hosted dashboard and API for MaruCheck. Bug reports, focused fixes,
accessibility improvements, and documentation are all welcome.

Verification behavior — risk scoring, adapters, contracts, drift, the MCP server — lives in the
[CLI repository](https://github.com/Kidus-M/MaruCheck/blob/main/CONTRIBUTING.md). If a change alters
what a verdict means, it belongs there.

Looking for somewhere to start? [docs/contributing/starter-issues.md](docs/contributing/starter-issues.md)
lists scoped tasks with acceptance criteria and the files each one touches. Every issue and pull
request gets a reply within 24 hours, even when that reply is "this needs a few days".

## Setup

Node.js 24 LTS and npm 11 or newer.

```bash
git clone https://github.com/Kidus-M/MaruCheck-Web.git
cd MaruCheck-Web
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## How much needs a database

Most of it does not. The public marketing site, the docs pages, and every component and styling
change render with the placeholder values from `.env.example`; the application shows an explicit
setup state instead of pretending authentication works.

You need a real Neon connection string and a Better Auth secret for sign-in, organizations, the
dashboard routes under `src/app/(dashboard)`, and the ingestion API. Follow the
[OAuth and GitHub setup guide](docs/oauth-and-github-setup.md), then:

```bash
npm run db:migrate
```

Use a disposable database. `npm run test:integration` is destructive by design and refuses to run
against anything that is not explicitly marked as a test database.

## Running the tests

```bash
npm test                 # deterministic Vitest suites, no database required
npm run typecheck        # next typegen && tsc --noEmit
npm run lint             # ESLint plus the Next.js rules
npm run format:check     # Prettier
npm run build            # production build
npm run check            # all of the above, in the order CI runs it

npm run test:e2e         # Playwright, desktop and mobile Chromium, needs a running app
npm run test:integration # destructive acceptance against an isolated database
```

`npm run check` is the gate. If it passes locally it passes in CI. The
[testing strategy](docs/testing.md) explains which layer a given test belongs in.

## Where things live

- `src/app/(marketing)` — the public product site, docs, and pricing. Server components.
- `src/app/(dashboard)` — organization-scoped projects, contracts, runs, findings, coverage, and
  QA memory. Server-rendered; a small client island handles active navigation.
- `src/app/api` — Route Handlers, including `/api/v1/ingest/runs` and `/api/v1/production-events`.
- `src/lib/dashboard-data.ts` — the organization-scoped data boundary. Dashboard pages read
  through it rather than querying directly, so scoping is enforced in one place.
- `src/db` — Drizzle schema and generated migrations in `drizzle/`.
- `tests/e2e` — Playwright specs; `tests/support` — shared fixtures.

## Working agreements

- Server components by default. Add a client island only when interaction requires it, and keep it
  small.
- Never widen the organization scope of a query. If a page needs new data, extend
  `src/lib/dashboard-data.ts` rather than reaching around it.
- The API accepts the CLI's versioned JSON report and nothing else. Source files, diffs, and
  artifact contents must not become acceptable payloads.
- Migrations are reviewed SQL: `npm run db:generate`, read the output, then commit it.
- Keep the two repositories decoupled. They exchange JSON schemas, never source imports.
- Accessibility is part of the definition of done, not a follow-up.

## Pull requests

Keep changes focused and say what you verified, including which browsers or viewports if the change
is visual. CI must pass formatting, linting, type checking, tests, and the build. By submitting a
contribution you agree that it may be distributed under the repository's [MIT License](LICENSE).
