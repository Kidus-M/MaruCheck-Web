# ADR-008: Use one guarded production release workflow

## Status

Accepted

## Date

2026-08-21

## Context

ADR-007 introduced a separate private-beta deployment path. The intended first users are a small
group of developer friends, but maintaining beta and production workflows would duplicate secrets,
databases, deployment state, and operational learning. The goal is to test the real distribution,
not a second environment that later needs to be rebuilt.

The release still needs isolation before production migration, an approval boundary before
external changes, and a way to prove the exact staged deployment before assigning the public domain.

## Decision

- Supersede ADR-007 and use one manual `Production release` GitHub workflow.
- Run migration, database integration, build, and browser acceptance against a disposable Neon
  branch first.
- Put production database migration and Vercel deployment behind the GitHub `production`
  environment and required reviewers.
- Pull Production environment values from the linked Vercel project rather than copying database
  and authentication secrets into workflow YAML.
- Build a staged production deployment with no domain assignment, smoke it, promote it, and smoke
  the stable production domain.
- Use the existing production signup allowlist for invited testing. Do not create a separate beta
  application, database, or release workflow.
- Keep the CLI in its independent repository and distribute it through npm rather than the web
  deployment.

## Consequences

- Friends test the actual production URL and package path that later users will receive.
- There is one set of hosted secrets, migrations, logs, and rollback procedures.
- Production release remains manual and auditable while early usage is small.
- A failed production migration can still precede a failed application deployment, so migrations
  must remain backward compatible and database recovery remains separate from Vercel rollback.

## Alternatives considered

### Keep a separate beta environment

Rejected because it doubles configuration and delays learning about the real production path.

### Deploy from every push to `main`

Rejected for now because the workflow includes a production database mutation and should require an
explicit owner approval until operations are routine.

### Let Vercel deploy before acceptance

Rejected because a production build is not evidence that real migrations, transactions, and browser
flows work. The staged URL is promoted only after its smoke check passes.
