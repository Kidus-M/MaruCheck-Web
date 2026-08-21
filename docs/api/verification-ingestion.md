# Verification report ingestion

`POST /api/v1/ingest/runs` stores a completed MaruCheck verification report for one connected
project. It accepts metadata and artifact references; it does not receive source code or execute
tests.

## Authentication

An organization owner connects the repository at `/projects/connect`. MaruCheck shows the raw
project token once and stores only its hash.

```http
Authorization: Bearer maru_<project-token>
Content-Type: application/json
```

Keep the token in the CI provider's encrypted secret store as `MARUCHECK_TOKEN`. Do not add it to
the repository or write it into a verification artifact.

## Request

The envelope is versioned independently from the embedded CLI report:

```json
{
  "schemaVersion": 1,
  "branch": "main",
  "commitSha": "8f2c1a7d5e3b",
  "title": "fix: enforce invoice ownership",
  "startedAt": "2026-08-19T10:00:00.000Z",
  "completedAt": "2026-08-19T10:01:42.000Z",
  "report": {
    "schemaVersion": 1,
    "generatedAt": "2026-08-19T10:01:42.000Z",
    "project": { "name": "maru-web" },
    "runId": "RUN-1048",
    "risk": { "level": "critical", "score": 92 },
    "gate": { "status": "blocked", "reasons": ["1 blocking finding remains open."] },
    "evidence": [],
    "findings": [],
    "requirementEvidence": []
  }
}
```

The `report` object is the same schema-versioned object written to
`.maru/artifacts/runs/<run-id>/report.json`. The endpoint bounds the body at 2 MB, evidence at 500
items, findings at 250 items, and requirement mappings at 1,000 items. The project-scoped bearer
token is the authoritative destination. `report.project.name` remains local report metadata and
does not need to equal the project's dashboard display name.

```bash
curl --fail-with-body \
  -H "Authorization: Bearer $MARUCHECK_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @ingest.json \
  https://your-marucheck-host/api/v1/ingest/runs
```

## Responses

- `202` — the run and normalized proof metadata were accepted.
- `400` — the envelope or embedded report is invalid.
- `401` — the token is missing, invalid, expired, or revoked.
- `413` — the request exceeds 2 MB.
- `500` / `503` — persistence failed or is not configured; retrying the same run is idempotent.
