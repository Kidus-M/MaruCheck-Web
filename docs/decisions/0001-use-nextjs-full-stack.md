# ADR-001: Use Next.js for the initial hosted frontend and backend

## Status

Accepted

## Date

2026-08-15

## Context

MaruCheck needs a hosted dashboard, authenticated API, and project-management surface. These components share one initial deployment lifecycle and product team. Splitting the frontend and backend immediately would add networking, deployment, authentication, and observability overhead before independent scaling is required.

## Decision

Use the Next.js App Router for the hosted UI and Route Handlers for the initial hosted API. Keep this application in its own `maru-web` repository, separate from the local CLI and verification engine.

Use Next.js worker threads for build isolation. This preserves framework type checking and route validation in managed environments where child-process forks are prohibited.

## Consequences

### Positive

- UI and server changes can ship atomically.
- React Server Components minimize unnecessary client JavaScript.
- One deployment simplifies authentication and operational setup during early phases.
- The CLI remains isolated from hosted framework dependencies.

### Negative

- Long-running verification work cannot execute inside request handlers and will eventually need a worker.
- Care is required to keep public API schemas independent from Next.js route implementations.

### Neutral

- A worker becomes a separate sibling repository when its release or scaling lifecycle diverges.

## Alternatives considered

- **Separate frontend and API repositories:** rejected as premature operational complexity.
- **Add the dashboard to the CLI repository:** rejected because hosted and local tooling have different release and trust boundaries.
- **Adopt a separate API framework now:** deferred until requirements exceed Route Handler capabilities.
