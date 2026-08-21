# ADR-007: Stage the private beta on Vercel with Neon branches

## Status

Accepted

## Date

2026-08-21

## Context

The hosted application is feature-complete enough for design-partner testing, but it needs a safe
path from reviewed code to a protected deployment. Next.js already targets Vercel and persistence
already targets Neon. The highest-risk release actions are schema migration, real transaction
behavior, accidental open signup, and promoting an untested deployment.

## Decision

- Deploy `maru-web` as its own Vercel project and keep `maru-cli` independently released.
- Use a persistent Neon `beta` branch for invited users and an ephemeral branch for each manual
  Beta readiness workflow.
- Keep migrations outside application startup. Validate the environment, inspect generated SQL,
  and apply migrations through the direct Neon endpoint before promotion.
- Require deterministic unit tests, real-Neon ingestion integration, a production build, Chromium
  acceptance, and post-deployment smoke checks.
- Lock production signup unless an address is allowlisted or open signup is explicitly enabled.
- Expose separate liveness and readiness endpoints without returning configuration or database
  error details.
- Protect beta access at the deployment edge and retain application-level authentication and
  organization boundaries behind it.
- Run bounded retention through authenticated Vercel Cron and use database-backed Better Auth rate
  limiting for serverless consistency.
- Roll application code back through Vercel. Treat database recovery as a separate reviewed action;
  never assume an application rollback safely reverses schema or data changes.

## Consequences

### Positive

- Every database-mutating acceptance run is isolated and disposable.
- Beta access, signup, migration, promotion, health, and rollback have explicit gates.
- The deployment matches the existing Next.js and Neon architecture without adding a new runtime.

### Negative

- A release requires coordinated GitHub, Neon, and Vercel configuration.
- Persistent beta migrations still require an operator after the disposable acceptance run passes.
- External error monitoring remains a separate tool decision; the first gate relies on health,
  Vercel logs, Neon state, and an incident runbook.

## Alternatives considered

### Deploy directly from every merge

Rejected for the private beta because application deployment cannot safely own an irreversible
database migration and a green build does not prove real transaction behavior.

### Test against the persistent beta database

Rejected because acceptance cleanup or a failed test could alter tester data. Ephemeral Neon
branches provide the production schema boundary without sharing beta state.

### Add a second hosting or monitoring platform now

Deferred. Vercel and Neon already match the implemented runtime. Error monitoring should be chosen
after beta traffic shows whether Vercel-native signals are sufficient or Sentry is warranted.

