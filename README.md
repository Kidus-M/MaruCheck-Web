# MaruCheck Web

[![CI](https://github.com/Kidus-M/MaruCheck-Web/actions/workflows/ci.yml/badge.svg)](https://github.com/Kidus-M/MaruCheck-Web/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-6678e8.svg)](LICENSE)

The Next.js full-stack dashboard and hosted API for MaruCheck. It is maintained separately from the local-first CLI so cloud deployments and CLI releases remain independent.

MaruCheck Web is open source under the [MIT License](LICENSE). The local verifier lives in the
separate [MaruCheck CLI repository](https://github.com/Kidus-M/MaruCheck); issues and focused pull
requests are welcome in the repository that owns the affected behavior.

Production: [marucheck.dev](https://marucheck.dev)

## Quick start

Requirements: Node.js 24 LTS and npm 11 or newer.

```bash
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000` for the public product site or `http://localhost:3000/dashboard` for the hosted product. Liveness is available at `/api/health/live`; `/api/health/ready` also verifies production-shaped configuration, database connectivity, and the authentication rate-limit schema. `/api/health` is a readiness alias.

Before migrating, create `.env.local` from `.env.example` and replace the sample values with your Neon pooled and direct connection strings plus a Better Auth secret. The application shows a setup state instead of pretending authentication works when those values are absent. Follow the [OAuth and GitHub setup guide](docs/oauth-and-github-setup.md) to enable GitHub repository discovery and GitHub/Google sign-in.

The hosted foundation includes a verification-command public site built from real CLI and MCP workflows, product and availability pages, practical documentation, the release dashboard, projects, Quality Contracts, verification runs, findings, requirement coverage, QA memory, production feedback, Better Auth sign-in, and organization management. See the [dashboard guide](docs/phase-11-dashboard.md).

## Current readiness

The repository has one guarded production release path: configurable open, allowlisted, or locked signup; durable authentication rate limiting; liveness/readiness checks; authenticated scheduled retention; security headers; disposable-Neon integration acceptance; desktop/mobile Playwright coverage; staged Vercel promotion; and smoke checks before and after promotion. The application is deployed for developer testing. Environment values, migrations, OAuth/email delivery, monitoring, and external acceptance still need to be verified in each deployment rather than inferred from source code.

Follow the [production deployment runbook](docs/production-deployment.md), [testing strategy](docs/testing.md), and [incident response runbook](docs/operations/production-incident-response.md).

## Commands

| Command                       | Description                                               |
| ----------------------------- | --------------------------------------------------------- |
| `npm run dev`                 | Start the development server                              |
| `npm run build`               | Create a production build                                 |
| `npm run start`               | Serve the production build                                |
| `npm run deploy:env:check`    | Validate the configured production environment            |
| `npm run deploy:smoke -- URL` | Verify a deployment and its security headers              |
| `npm run db:generate`         | Generate reviewed SQL from the Drizzle schema             |
| `npm run db:check`            | Check the Drizzle migration history                       |
| `npm run db:migrate`          | Apply migrations using the guarded direct Neon connection |
| `npm run db:studio`           | Open Drizzle Studio                                       |
| `npm run feedback:prune`      | Dry-run production-feedback retention cleanup             |
| `npm run lint`                | Run ESLint and Next.js rules                              |
| `npm test`                    | Run deterministic Vitest suites                           |
| `npm run test:integration`    | Run destructive acceptance on an explicitly isolated DB   |
| `npm run test:e2e`            | Run Chromium desktop/mobile acceptance                    |
| `npm run typecheck`           | Run TypeScript without emitting files                     |
| `npm run check`               | Run all repository quality gates                          |

## Architecture

- App Router and React Server Components by default.
- A small client island handles active navigation; dashboard data and pages remain server-rendered.
- Route Handlers provide the initial hosted API in the same Next.js deployment.
- Better Auth owns users, sessions, encrypted social-provider tokens, organizations, members, and invitations. Neon Postgres and Drizzle provide persistence and migrations.
- The project connection page discovers repositories through the signed-in user's linked GitHub account and revalidates the selected metadata on the server before issuing a MaruCheck project token.
- `src/lib/dashboard-data.ts` is the organization-scoped hosted metadata boundary for projects, contracts, runs, findings, coverage, and QA memory.
- CI sends the CLI's versioned report to `POST /api/v1/ingest/runs` with a hashed, project-scoped token. The repositories exchange JSON schemas, never source imports.
- Production systems send bounded, provider-neutral failures to `POST /api/v1/production-events`. MaruCheck aggregates them and creates review-required QA-memory candidates; it never accepts raw source or activates telemetry-provided code.
- A separate worker repository will be introduced only when independent scaling is required.

See [ADR-001](docs/decisions/0001-use-nextjs-full-stack.md), [ADR-002](docs/decisions/0002-use-proof-orbit-dashboard-system.md), [ADR-003](docs/decisions/0003-self-host-better-auth-on-neon.md), [ADR-004](docs/decisions/0004-use-verification-command-public-system.md), [ADR-005](docs/decisions/0005-store-organization-scoped-proof-metadata.md), [ADR-006](docs/decisions/0006-ingest-bounded-production-feedback-as-reviewable-memory.md), [ADR-008](docs/decisions/0008-use-one-guarded-production-release-workflow.md), and [ADR-011](docs/decisions/0011-use-social-oauth-for-repository-discovery.md). ADR-008 supersedes the separate beta path in ADR-007. Request contracts are documented in the [verification ingestion guide](docs/api/verification-ingestion.md) and [production-feedback guide](docs/api/production-feedback.md); the latter includes an [OpenAPI 3.1 document](docs/api/openapi-v1.yaml).

## Codex and MCP

This repository includes an optional project-scoped Codex configuration at `.codex/config.toml`.
It starts the exact published MaruCheck package, so contributors do not need the CLI repository as a
sibling checkout.

Any supported MCP client can launch the public CLI directly:

```toml
[mcp_servers.maru]
command = "npx"
args = ["--yes", "marucheck@0.3.0", "mcp"]
```

For reproducible teams, install `marucheck@0.3.0` exactly and replace the arguments with `["--no-install", "maru", "mcp"]`. The server is not marked as required, so contributors who use another coding client can work normally. Non-Codex clients ignore `.codex/config.toml`. Current Codex, Claude Code, and Cursor setup instructions are served at `/docs/mcp` by the application and maintained in the [CLI repository guide](https://github.com/Kidus-M/MaruCheck/blob/main/docs/guides/phase-3-mcp-integration.md).

## Contributing

Open a focused issue or pull request in [MaruCheck Web](https://github.com/Kidus-M/MaruCheck-Web).
Run `npm run check` before requesting review. CLI behavior and adapters should be proposed in the
[CLI repository](https://github.com/Kidus-M/MaruCheck/blob/main/CONTRIBUTING.md).

## License

Copyright 2026 Kidus Mesfin Teferi. Distributed under the [MIT License](LICENSE).
