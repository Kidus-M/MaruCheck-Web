# Production deployment

MaruCheck uses one production workflow for release testing and deployment. There is no separate
beta application or beta database. Early developer access is controlled through the production
email allowlist while friends test the same deployment that will eventually become public.

## Release flow

```text
manual Production release approval
  -> disposable Neon branch
  -> migrations + real database integration
  -> production build + Playwright
  -> guarded migration of the production Neon database
  -> staged Vercel production deployment
  -> deployment smoke test
  -> promote to the production domain
  -> production-domain smoke test
```

The application remains closed by default in source. For the current public tester launch, set
`MARUCHECK_OPEN_SIGNUPS=true` in Vercel Production and leave
`MARUCHECK_ALLOWED_SIGNUP_EMAILS` unset. Return to the allowlist before redeploying if public
registration needs to be paused.

## One-time GitHub configuration

Create a GitHub environment named `production`, add required reviewers, and configure:

| Name                              | Kind            | Purpose                                            |
| --------------------------------- | --------------- | -------------------------------------------------- |
| `NEON_API_KEY`                    | secret          | create and delete disposable acceptance branches   |
| `NEON_PROJECT_ID`                 | variable        | Neon project containing the production database    |
| `VERCEL_TOKEN`                    | secret          | link, build, stage, and promote the Vercel project |
| `VERCEL_ORG_ID`                   | secret          | non-interactive Vercel account/team selection      |
| `VERCEL_PROJECT_ID`               | secret          | non-interactive Vercel project selection           |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | optional secret | smoke a protected deployment                       |
| `PRODUCTION_URL`                  | variable        | stable HTTPS origin, without a trailing slash      |

The Neon API key should have only the project access required for branch lifecycle operations. The
Vercel token should be limited to the MaruCheck project/team.

## Vercel production environment

Import only `Kidus-M/MaruCheck-Web`; the CLI remains a separate npm/GitHub release. Configure these
Vercel Production environment variables:

| Variable                                      | Required      | Value                                                     |
| --------------------------------------------- | ------------- | --------------------------------------------------------- |
| `DATABASE_URL`                                | yes           | pooled TLS URL for the production Neon branch             |
| `DATABASE_URL_UNPOOLED`                       | yes           | direct TLS URL used only by the guarded migration command |
| `BETTER_AUTH_SECRET`                          | yes           | independent random value of at least 32 characters        |
| `BETTER_AUTH_URL`                             | yes           | exact stable HTTPS production origin                      |
| `CRON_SECRET`                                 | yes           | separate random value for authenticated retention         |
| `MARUCHECK_ALLOWED_SIGNUP_EMAILS`             | optional      | leave unset for public testing; use to return to invites  |
| `MARUCHECK_OPEN_SIGNUPS`                      | tester launch | set to `true` for public account creation                 |
| `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` | optional pair | production GitHub OAuth application                       |

Register `<BETTER_AUTH_URL>/api/auth/callback/github` in the GitHub OAuth application when GitHub
sign-in is enabled. Do not reuse credentials between the database, authentication, cron, project
ingestion, or deployment protection.

## Release procedure

1. Push the reviewed web commit and confirm normal CI is green.
2. In GitHub Actions, run **Production release** and approve the `production` environment.
3. The workflow proves migrations and behavior on a disposable Neon branch before it can touch the
   production database.
4. The guarded migration runs with Vercel's Production environment variables. It accepts only a
   direct TLS Neon URL and requires the explicit production-migration confirmation.
5. Vercel builds a staged production deployment without assigning the domain. The workflow smokes
   that URL, promotes it, and smokes `PRODUCTION_URL` again.
6. Open tester registration only after both smoke checks pass. Ask each tester to connect a
   disposable project, copy the one-time token, upload one CLI report, rotate the token, and verify
   the old token no longer works.
7. Record the Git commit, migration, deployment URL, workflow run, and participating testers.

## Rollback

For an application regression, use Vercel rollback to restore the previous accepted deployment and
rerun `npm run deploy:smoke -- <production-url>`. Do not reverse a schema migration automatically.
Preserve the Neon state, compare schema compatibility, and use a recovery branch when data restore
is required. Follow the [production incident runbook](operations/production-incident-response.md).

## References

- [Neon branching with GitHub Actions](https://neon.com/docs/guides/branching-github-actions)
- [Vercel environment command](https://vercel.com/docs/cli/env)
- [Vercel staged production deployments](https://vercel.com/docs/cli/deploying-from-cli)
- [Vercel production rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
