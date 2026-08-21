# Production feedback ingestion

`POST /api/v1/production-events` records a bounded production failure for one connected project.
It links the signal to exact verification evidence when possible and creates a review-required QA
Memory candidate. It does not receive source code, execute a proposed test, diagnose a root cause,
or change a Quality Contract.

The machine-readable contract is [OpenAPI 3.1](openapi-v1.yaml).

## Authentication and delivery identity

Use the same one-time project token shown by `/projects/connect` and keep it in the producer's
encrypted secret store. Generate a stable event ID in the producer and send it in both places:

```http
Authorization: Bearer maru_<project-token>
Content-Type: application/json
Idempotency-Key: evt-prod-0001
```

Delivery behavior is explicit:

- same project, source, event ID, and payload: `200`, `replayed: true`, no new occurrence;
- same event ID with different content: `409`, original event remains unchanged;
- different event ID with the same fingerprint: accepted and aggregated as another occurrence.

## Example

```bash
curl --fail-with-body https://your-marucheck-host/api/v1/production-events \
  -H "Authorization: Bearer $MARUCHECK_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: evt-prod-0001" \
  --data-binary @production-event.json
```

```json
{
  "schemaVersion": 1,
  "event": {
    "id": "evt-prod-0001",
    "source": "generic",
    "type": "exception",
    "fingerprint": "invoice-cross-tenant-read",
    "title": "Cross-tenant invoice read",
    "severity": "critical",
    "occurredAt": "2026-08-21T07:58:00.000Z",
    "environment": "production",
    "release": "web@2026.08.21.1",
    "commitSha": "8f2c1a7d5e3b",
    "branch": "main",
    "exception": {
      "type": "AuthorizationBoundaryError",
      "message": "Invoice lookup crossed an organization boundary.",
      "frames": [
        {
          "file": "src/invoices/read-invoice.ts",
          "line": 84,
          "function": "readInvoice"
        }
      ]
    },
    "contractRefs": ["invoice-access"],
    "requirementRefs": ["invoice-access#INV-001"],
    "relatedFiles": ["src/invoices/read-invoice.ts"],
    "reproduction": {
      "observed": "An invoice from another organization was returned.",
      "steps": ["Use a valid session from organization A", "Request an invoice owned by B"]
    },
    "regression": {
      "objective": "Reject cross-organization invoice reads.",
      "requirementRefs": ["invoice-access#INV-001"],
      "suggestedAdapter": "vitest",
      "suggestedPath": "src/invoices/read-invoice.test.ts"
    },
    "tags": ["authorization", "invoice"],
    "attributes": { "http.route": "/api/invoices/:id", "http.status_code": 500 }
  }
}
```

Unknown fields are rejected. Paths must be project-relative. Arrays, strings, frames, and scalar
attributes are bounded; raw stack text, source code, commands, and nested arbitrary payloads are
not part of the contract. Timestamps must be canonical ISO strings and cannot be more than five
minutes in the future.

## Response and review

New deliveries return `201`; exact replays return `200`:

```json
{
  "accepted": true,
  "candidateId": "6bb60f3f-4175-4f61-a3e0-c9cd14646025",
  "feedbackId": "bd453ed3-b62a-46c5-b373-157a297941d2",
  "occurrenceCount": 1,
  "replayed": false,
  "schemaVersion": 1
}
```

Open `/feedback` in the authenticated dashboard. A reviewer may reject the proposal or confirm its
root cause and link a reviewed Vitest/Playwright test. Only approval creates active QA Memory. The
production failure remains open until a separate resolution signal exists.

Every error uses `application/problem+json`, a stable `type`, and `X-Request-Id`. `429` includes
`Retry-After`; retry `503` with the identical event ID and payload.

## Retention operations

Production feedback expires after 90 days, rate windows after 24 hours, and ingestion audit records
after 365 days. Inspect eligible rows without deleting them:

```bash
npm run feedback:prune
```

After reviewing the counts, a deployment scheduler can perform the cleanup:

```bash
npm run feedback:prune -- --execute
```

Run this only with the intended environment's database credentials. The command never prints the
connection string or project tokens.
