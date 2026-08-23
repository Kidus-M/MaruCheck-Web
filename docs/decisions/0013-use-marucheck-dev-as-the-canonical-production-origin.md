# ADR-013: Use marucheck.dev as the canonical production origin

## Status

Accepted

## Date

2026-08-23

## Context

The first tester deployment used Vercel's generated `maru-check.vercel.app` hostname. MaruCheck now
owns `marucheck.dev`, which provides a stable product identity independent of a deployment-provider
hostname. The production origin affects more than marketing links: Better Auth origin validation,
OAuth callbacks, generated project connection settings, CLI report ingestion, deployment smoke
tests, repository metadata, and search-engine discovery must agree on one value.

Serving the authentication flow from multiple public production origins would create separate
host-only sessions and expand the trusted-origin and callback surface. Keeping the generated Vercel
hostname as the advertised URL would also make future hosting changes unnecessarily visible to CLI
users.

## Decision

- Use `https://marucheck.dev` as the canonical public and authenticated production origin.
- Set both the GitHub `PRODUCTION_URL` variable and Vercel Production `BETTER_AUTH_URL` to that exact
  origin without a trailing slash.
- Register the GitHub and Google production OAuth callbacks under `marucheck.dev`.
- Keep the generated Vercel hostname only as an operational alias and redirect public traffic to the
  canonical domain.
- Generate site metadata, robots policy, sitemap entries, dashboard connection settings, CLI upload
  documentation, and deployment verification from the canonical origin.
- Make the guarded production workflow reject a mismatched `PRODUCTION_URL` or `BETTER_AUTH_URL`
  before migration and promotion.

## Consequences

- Authentication cookies, CSRF origin validation, OAuth redirects, report upload configuration, and
  public URLs share one stable origin.
- Existing `.maru/connection.env` files that contain the Vercel hostname continue working while the
  alias remains attached, but users should replace `MARUCHECK_URL` with `https://marucheck.dev`.
- Domain or OAuth changes require a new guarded production deployment and production-domain smoke
  test.
- Rolling back application code does not require rolling back DNS. If the custom domain itself
  fails, the generated Vercel hostname remains an operator-only recovery path.

## Alternatives considered

### Keep the Vercel hostname canonical

Rejected because it exposes an infrastructure provider in the permanent product and CLI contract.

### Serve both origins without redirects

Rejected because it splits sessions, weakens canonical search signals, and requires additional
trusted origins and OAuth callbacks.

### Make www.marucheck.dev canonical

Vercel supports and recommends this pattern for some DNS configurations, but the product owner
selected the concise apex domain. `www.marucheck.dev` can redirect to the apex origin.
