# Web testing strategy

MaruCheck uses four layers so a successful build cannot stand in for product behavior.

| Layer                   | Command                                          | Boundary                                                                                      |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Unit and route behavior | `npm test`                                       | deterministic parsers, policy, health, retention, and HTTP behavior                           |
| Database integration    | `npm run test:integration`                       | real transactions, project-token authentication, replay, aggregation, and conflict behavior   |
| Browser acceptance      | `npm run test:e2e`                               | desktop/mobile navigation, the route-reveal regression, sign-in, health, and security headers |
| Deployed smoke          | `npm run deploy:smoke -- https://example.com` | the actual deployment, database readiness, public routes, and headers                         |

## Safe database acceptance

Integration tests intentionally refuse `DATABASE_URL`. They require a disposable Neon branch plus:

```bash
TEST_DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
TEST_DATABASE_URL_UNPOOLED=postgresql://.../neondb?sslmode=require
ALLOW_TEST_DATABASE_MUTATIONS=true
```

Run `npm run db:migrate` against that branch before `npm run test:integration`. The GitHub
**Production release** workflow performs this isolated lifecycle before production migration and
deletes its branch in an `always()` step.

## Browser diagnostics

Install Chromium once with `npx playwright install chromium`, then run `npm run test:e2e`. Failed CI
runs retain traces, screenshots, and the HTML report under `output/playwright/` for seven days.
Tests honor reduced-motion behavior through the application and cover client navigation without a
manual reload.

## Remaining coverage

Before open registration, add browser tests for organization invitations, the complete Quality
Contract lifecycle, reviewer approval, and concurrent token rotation. Invited production testing
covers those flows until they are automated.
