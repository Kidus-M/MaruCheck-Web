# Private beta deployment

This runbook deploys `maru-web` to Vercel with a persistent Neon beta branch. It keeps database
migrations separate from application deployment and proves every migration against a disposable
Neon branch first.

## Release topology

```text
GitHub pull request
  -> CI quality gate
  -> Beta readiness workflow
       -> disposable Neon branch
       -> migrations + database integration
       -> production build + Playwright
       -> branch deleted
  -> persistent Neon beta branch migration
  -> protected Vercel beta deployment
  -> deployed smoke workflow
  -> invite testers
```

The beta is deliberately closed by default. Production signup is enabled only for addresses in
`MARUCHECK_BETA_EMAILS` unless `MARUCHECK_OPEN_SIGNUPS=true` is explicitly set.

## One-time account setup

1. Import `Kidus-M/MaruCheck-Web` into Vercel as its own project. Do not import the parent folder or
   the CLI repository.
2. Create a persistent Neon branch named `beta` from the current production/default branch. Use its
   pooled URL for the application and its direct URL only for reviewed migrations.
3. In the GitHub repository, create the `beta` environment and add:
   - secret `NEON_API_KEY` with permission to create and delete branches;
   - variable `NEON_PROJECT_ID`;
   - optional secret `VERCEL_AUTOMATION_BYPASS_SECRET` when the beta deployment is protected.
4. Enable Vercel Deployment Protection for the beta deployment. Share access only with approved
   testers; keep the automation bypass secret in GitHub, never in client code.
5. Use one stable HTTPS beta hostname. Set `BETTER_AUTH_URL` to that exact origin and register its
   `/api/auth/callback/github` callback when GitHub OAuth is enabled.

## Vercel beta environment

Set these values for the environment that serves the beta:

| Variable                                      | Required           | Value                                                |
| --------------------------------------------- | ------------------ | ---------------------------------------------------- |
| `DATABASE_URL`                                | yes                | pooled TLS URL for the persistent Neon `beta` branch |
| `DATABASE_URL_UNPOOLED`                       | migration job only | direct TLS URL; do not expose it to the browser      |
| `BETTER_AUTH_SECRET`                          | yes                | independent random value of at least 32 characters   |
| `BETTER_AUTH_URL`                             | yes                | exact stable HTTPS beta origin                       |
| `CRON_SECRET`                                 | yes                | separate random value used by the retention endpoint |
| `MARUCHECK_BETA_EMAILS`                       | recommended        | comma-separated approved tester addresses            |
| `MARUCHECK_OPEN_SIGNUPS`                      | optional           | leave unset or `false` for private beta              |
| `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` | optional pair      | beta GitHub OAuth application                        |

Do not reuse a project ingest token, database password, Better Auth secret, cron secret, or Vercel
bypass secret for another purpose.

## Release procedure

1. Push the reviewed web commits and wait for the normal `CI` workflow.
2. Run **Beta readiness** from GitHub Actions. It creates a one-day Neon branch, applies all
   migrations, runs the real database ingestion acceptance test, builds the production app, runs
   browser acceptance, uploads failure diagnostics, and deletes the branch even on failure.
3. Review the generated SQL in `drizzle/`. Against the persistent beta branch, export its direct URL
   as `DATABASE_URL_UNPOOLED` and set `MARUCHECK_DEPLOYMENT_ENV=beta`, then run:

   ```bash
   npm ci
   npm run beta:env:check
   npm run db:migrate
   ```

   Production migrations additionally require `ALLOW_PRODUCTION_MIGRATION=true`; this is an
   intentional confirmation gate.

4. Deploy or promote the tested commit to the protected beta hostname.
5. Run **Beta deployment smoke** with the HTTPS beta origin. The check proves liveness, database
   readiness, key public routes, sign-in rendering, and required security headers.
6. Sign in with an allowlisted address, connect a disposable test project, copy its one-time token,
   ingest one CLI verification report, rotate the token, and confirm the old token fails.
7. Record the tested commit, migration number, Neon branch, deployment URL, and smoke workflow run
   in the release notes before inviting testers.

## Acceptance gate

The beta is ready for testers only when all of these are true:

- normal CI and Beta readiness are green for the same commit;
- `/api/health/live` and `/api/health/ready` return `200`;
- the deployed smoke workflow passes;
- an allowlisted user can sign in and an unlisted user cannot create an account;
- project token creation, copying, report ingestion, rotation, and revocation work;
- the daily retention invocation is visible in Vercel logs;
- a named person owns rollback and tester communication.

## Rollback

If application behavior regresses, roll the Vercel deployment back to the last accepted commit and
rerun the deployed smoke workflow. Do not reverse a database migration automatically: restore or
branch the database only after comparing the old application schema requirements with the applied
migration. Follow [the beta incident runbook](operations/beta-incident-response.md).

## References

- [Neon branching with GitHub Actions](https://neon.com/docs/guides/branching-github-actions)
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Vercel deployment checks](https://vercel.com/docs/deployment-checks)
- [Vercel promoting a deployment](https://vercel.com/docs/deployments/promoting-a-deployment)
- [Vercel production rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
