# ADR-006: Ingest bounded production feedback as reviewable memory candidates

## Status

Accepted

## Date

2026-08-21

## Context

Verification reports show what MaruCheck proved before release, while production failures show
which assumptions escaped that proof. Phase 15 needs to connect those signals without turning the
hosted application into a source-code collector, an error-monitoring vendor, or another autonomous
test generator.

Production delivery is retry-heavy and adversarial at the HTTP boundary. A repeated delivery must
not inflate occurrence counts, a reused event key must not overwrite history, and one project token
must never affect another project. Production telemetry can suggest a reproduction, but it cannot
prove a root cause or safely activate executable code by itself.

## Decision

- Expose `POST /api/v1/production-events` as a versioned resource collection. Version 1 supports a
  provider-neutral `generic` source shaped around structured exception frames.
- Authenticate with the existing hashed, project-scoped bearer token. Require `Idempotency-Key` to
  exactly equal `event.id`, require `application/json`, and cap the body at 256 KB.
- Accept structured metadata only: project-relative file paths, exception type/message/frames,
  commit, environment, bounded scalar attributes, contract references, and reproduction/regression
  proposals. Reject unknown fields, absolute paths, raw source, commands, and arbitrary nested data.
- Hash the canonical parsed payload. The same event key and hash returns a replay response without
  incrementing occurrences; the same key with different content returns `409 Conflict`. Different
  event keys sharing a fingerprint aggregate into one production failure.
- Serialize concurrent retries for the same project and event key with a transaction-scoped
  Postgres advisory lock. Enforce a durable 60-request-per-minute window per project token.
- Link only exact commit-SHA verification runs and explicitly declared Quality Contract keys within
  the token's organization and project scope. Missing links remain visible rather than inferred.
- Create one pending QA-memory candidate containing data-only reproduction and regression
  proposals. A signed-in reviewer must confirm the root cause and link a reviewed Vitest or
  Playwright test before an active QA-memory record is created. Approval does not claim the live
  production incident is resolved, and neither ingestion nor review changes a Quality Contract.
- Retain production aggregates and delivery records for 90 days, rate windows for 24 hours, and
  ingestion audit entries for 365 days. The maintenance command is dry-run by default and requires
  `--execute` to delete eligible records.
- Record accepted, replayed, and conflicting deliveries in an organization/project-scoped audit
  table. Return RFC 9457-style problem details with stable type URIs and request IDs.

## Component flow

```text
producer
  -> bounded HTTP parser
  -> project-token authentication
  -> durable rate + idempotency transaction
  -> fingerprint aggregate
  -> exact commit / declared contract links
  -> pending QA-memory candidate
  -> human review
  -> active QA memory + reviewed regression link
```

## Consequences

### Positive

- MaruCheck learns from production failures without receiving repository source or executing
  telemetry-provided code.
- Retries are deterministic, concurrent delivery is serialized, and fingerprint aggregation does
  not erase immutable delivery history.
- The review gate keeps product intent and executable regressions under human control.
- The generic contract can sit behind Sentry, OpenTelemetry, a job runner, or a small customer
  adapter without coupling the database model to one vendor.

### Negative

- Producers need a small mapping layer and must provide stable event IDs and fingerprints.
- Commit and contract associations are deliberately conservative; incomplete producer metadata
  produces incomplete linkage.
- Retention enforcement requires an external scheduler to run the committed maintenance command.
- The database integration path still needs to be exercised against an isolated production-like
  Neon branch before private beta.

## Failure modes and mitigations

- **Concurrent replay increments twice:** acquire an advisory transaction lock before checking the
  immutable delivery key.
- **Event ID reused with altered content:** preserve the first delivery, audit the conflict, and
  return `409`.
- **Token leak or noisy producer:** support token rotation/revocation, use a durable per-token rate
  window, and never log the raw credential.
- **Cross-tenant contract or run link:** repeat organization and project predicates on every lookup
  and mutation.
- **Telemetry injects source or commands:** closed schemas reject unknown fields and accept only
  bounded scalars and project-relative paths.
- **False root cause becomes memory:** keep candidates pending until a workspace reviewer confirms
  the cause and attests a concrete repository test link.
- **Database unavailable:** return a retryable `503`; the producer can safely reuse the same event
  ID and payload.
- **Retention job misconfiguration:** default the maintenance command to a read-only count and
  require an explicit `--execute` argument.

## Alternatives considered

### Add a Sentry-specific integration first

Rejected for the first contract because it would make one vendor's payload and lifecycle the
domain model. A Sentry adapter can translate into the generic versioned envelope later.

### Ask an LLM to diagnose and generate a test automatically

Rejected because production telemetry is incomplete evidence. MaruCheck records proposals but does
not silently create executable code, assert a root cause, or change a Quality Contract.

### Treat every delivery as a separate failure

Rejected because retries and recurring fingerprints would flood the review queue. Immutable
delivery records plus a fingerprint aggregate preserve both auditability and a usable workflow.

### Use an in-memory rate limiter

Rejected because serverless instances do not share memory and restarts erase state. The small
Postgres window is durable and project-token scoped.
