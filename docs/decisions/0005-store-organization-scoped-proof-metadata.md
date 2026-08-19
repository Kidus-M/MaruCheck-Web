# ADR-005: Store organization-scoped proof metadata behind a versioned ingestion boundary

## Status

Accepted

## Date

2026-08-19

## Context

Better Auth already persists identity and organization membership in Neon Postgres, but the
dashboard still read a process-local demonstration snapshot. MaruCheck needs durable projects,
contracts, runs, findings, evidence, coverage, and QA memory without coupling the web repository to
the CLI source tree or moving source execution into the hosted application.

CI also needs a non-browser credential. Reusing Better Auth cookies would couple machine ingestion
to an interactive session and would make credentials difficult to scope or revoke.

## Decision

- Store hosted proof metadata in the same Neon Postgres database as Better Auth, using separate
  Drizzle-owned product tables and migration history.
- Put `organization_id` on every product record. Resolve the current organization inside the data
  repository and repeat that scope in every query and mutation.
- Bind a random project token to exactly one organization and project. Store only its SHA-256 hash
  and a non-secret prefix, show the raw token once, and support expiry and revocation columns.
- Accept the CLI's schema-versioned verification report through `POST /api/v1/ingest/runs`. Keep a
  small web-owned parser rather than importing CLI packages across repositories.
- Upsert one report atomically and idempotently by project and run ID. Preserve normalized evidence,
  finding reproduction, contract requirement coverage, and artifact references; do not upload or
  execute repository source.
- Use Neon's HTTP driver for bounded, parallel Server Component reads. Use the serverless WebSocket
  pool only for short transactions because Drizzle's Neon HTTP session does not implement
  transactions.

## Consequences

### Positive

- The dashboard is durable and multi-tenant instead of depending on a shared fixture.
- A token cannot write to another project, even if its payload names that project.
- The CLI and web repositories keep independent builds and release lifecycles.
- Replaying the same run updates its normalized records instead of creating duplicate runs.
- Source execution and source code remain in local development or CI.

### Negative

- The web app now owns a stable ingestion contract and must remain compatible with report schema 1.
- Project tokens need owner-facing rotation and revocation controls before broad production use.
- WebSocket-backed transactions add one connection mode beyond the HTTP read path.

### Neutral

- Artifact references are metadata. Object upload and retention policies can be introduced later
  without changing the normalized proof model.
- Contract records discovered through evidence remain drafts; CI cannot approve product intent.

## Failure modes and mitigations

- **Partial report write:** all report upserts run in a database transaction.
- **Cross-tenant access:** token lookup binds organization and project, and every write repeats both
  identifiers.
- **Leaked token:** only a hash is stored; schema supports expiry and revocation. Rotation UI remains
  a production-hardening task.
- **Oversized or malformed report:** the route enforces a 2 MB request limit, bounded arrays and
  strings, schema version checks, and typed status values.
- **Database unavailable:** ingestion returns a non-success response and CI can retry the same run
  safely.

## Alternatives considered

### Import CLI TypeScript packages into the web repository

Rejected because it would create cross-repository build and release coupling. The versioned JSON
contract is the intended boundary.

### Use browser sessions for CI ingestion

Rejected because cookies are user-scoped, interactive, and unsuitable for project-level rotation
or revocation.

### Use the Neon HTTP Drizzle driver for transactional writes

Rejected because the installed driver explicitly does not implement transactions. It remains the
lower-overhead path for bounded reads.

### Add a queue and worker now

Deferred. Report normalization is bounded metadata work and does not execute tests. A worker is
appropriate only when ingestion includes long-running processing or independent scaling.
