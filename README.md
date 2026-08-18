# MaruCheck Web

The Next.js full-stack dashboard and hosted API for MaruCheck. It is maintained separately from the local-first CLI so cloud deployments and CLI releases remain independent.

## Quick start

Requirements: Node.js 24 LTS and npm 11 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the public product site or `http://localhost:3000/dashboard` for the hosted product. The initial server health endpoint is available at `http://localhost:3000/api/health`.

The Phase 11 web foundation includes an animated marketing site, product and pricing pages, practical documentation, the release dashboard, projects, Quality Contracts, verification runs, findings, requirement coverage, QA memory, organization management, and a provider-neutral sign-in experience. See the [dashboard guide](docs/phase-11-dashboard.md).

## Commands

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the development server          |
| `npm run build`     | Create a production build             |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | Run ESLint and Next.js rules          |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run check`     | Run all repository quality gates      |

## Architecture

- App Router and React Server Components by default.
- A small client island handles active navigation; dashboard data and pages remain server-rendered.
- Route Handlers provide the initial hosted API in the same Next.js deployment.
- `src/lib/dashboard-data.ts` is the vendor-neutral metadata repository boundary. It uses deterministic demonstration data until authentication, PostgreSQL hosting, and ORM tooling are selected.
- Cloud-to-CLI communication will use explicit versioned schemas, never source imports across repositories.
- A separate worker repository will be introduced only when independent scaling is required.

See [ADR-001](docs/decisions/0001-use-nextjs-full-stack.md) and [ADR-002](docs/decisions/0002-use-proof-orbit-dashboard-system.md).

## Codex and MCP

This repository includes an optional project-scoped Codex configuration at `.codex/config.toml`. With the documented sibling layout, Codex can start the MaruCheck MCP server from `../maru-cli` while keeping both projects in independent Git repositories.

Build the CLI once before using the integration:

```bash
cd ../maru-cli
npm install
npm run build
```

The server is not marked as required, so contributors who clone only the web repository or use another coding client can work normally. Non-Codex clients ignore `.codex/config.toml`. Claude Code, Cursor, and custom MCP setup instructions are in the [Phase 3 MCP guide](https://github.com/Kidus-M/MaruCheck/blob/main/docs/guides/phase-3-mcp-integration.md).
