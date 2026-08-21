# Private beta incident response

Use this runbook when the beta is unavailable, authentication fails broadly, tenant isolation is in
doubt, ingestion is corrupt or unexpectedly rejected, or secrets may have leaked.

## Severity

- **Critical:** suspected cross-organization access, credential exposure, destructive data change,
  or widespread incorrect authorization. Stop tester access immediately.
- **High:** sign-in, readiness, token lifecycle, or ingestion is unavailable for most testers.
- **Moderate:** one workflow or project is degraded with a safe workaround.

## First 15 minutes

1. Name an incident owner and record the UTC start time, deployment ID, commit, and migration.
2. Check `/api/health/live` and `/api/health/ready`; run `npm run beta:smoke -- <beta-url>`.
3. Inspect Vercel function/build logs and Neon health/connection state. Do not paste credentials or
   raw project tokens into the incident record.
4. For Critical incidents, enable or tighten deployment protection and pause new invitations.
5. If the regression is application-only, use Vercel rollback to restore the last accepted
   deployment, then rerun the smoke workflow.

## Credential containment

- Revoke or rotate affected project ingest tokens from the project page.
- Rotate `BETTER_AUTH_SECRET` only with an explicit session-invalidation plan; users will need to
  sign in again.
- Rotate `CRON_SECRET`, Neon credentials, GitHub OAuth credentials, or the Vercel automation bypass
  independently when exposure is suspected.
- Never reuse the replacement values across environments.

## Database safety

Do not automatically run a down migration or delete a Neon branch. Preserve the affected branch,
capture the migration journal and deployment commit, and create a recovery branch at a point before
the incident when data restoration is required. Validate the recovered branch with Beta readiness
before changing application traffic.

## Recovery checks

- both health endpoints return `200` and the smoke workflow passes;
- an approved user can sign in and organization boundaries remain intact;
- project token rotation invalidates the previous token;
- one CLI report and one idempotent replay ingest correctly;
- no unexpected retention deletion occurred;
- the incident owner explicitly reopens tester access.

## Follow-up

Within two working days, document impact, timeline, detection, root cause, evidence, recovery,
missing guardrails, and one owned prevention task. Convert confirmed regressions into reviewed QA
Memory only after a repository test reproduces the issue.

