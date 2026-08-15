# MaruCheck Web

The Next.js full-stack dashboard and hosted API for MaruCheck. It is maintained separately from the local-first CLI so cloud deployments and CLI releases remain independent.

## Quick start

Requirements: Node.js 24 LTS and npm 11 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The initial server health endpoint is available at `http://localhost:3000/api/health`.

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
- Route Handlers provide the initial hosted API in the same Next.js deployment.
- Cloud-to-CLI communication will use explicit versioned schemas, never source imports across repositories.
- A separate worker repository will be introduced only when independent scaling is required.

See [ADR-001](docs/decisions/0001-use-nextjs-full-stack.md).
