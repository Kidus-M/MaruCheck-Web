# ADR-003: Self-host Better Auth on Neon Postgres

- Status: Accepted
- Date: 2026-08-18

## Context

MaruCheck needs durable users, sessions, organizations, roles, and invitations for its hosted web
application. The local-first CLI remains a separate repository and must not depend on browser
cookies or web application source code. The hosted data model also needs a portable PostgreSQL
foundation for projects, contracts, verification runs, findings, coverage, and QA memory.

The team chose Better Auth over Neon Auth. Neon remains the PostgreSQL provider, but identity is
implemented in the application so MaruCheck can add custom organization rules, CLI/API credentials,
and additional Better Auth plugins without depending on the feature limits of a managed auth layer.

## Decision

- Run Better Auth 1.7 inside the Next.js application at `/api/auth/[...all]`.
- Use Better Auth's email/password flow and organization plugin. GitHub OAuth is optional.
- Use the official Better Auth Drizzle adapter and keep the Better Auth tables in the same Neon
  database as future hosted metadata.
- Use Neon’s pooled `DATABASE_URL` from the application and the direct
  `DATABASE_URL_UNPOOLED` for Drizzle migrations.
- Use Drizzle Kit for reviewed SQL migrations. Better Auth owns authentication behavior; Drizzle
  owns schema history and deployment.
- Protect authenticated route groups in their server layout and repeat authorization beside every
  database query and mutation. Route visibility alone is not authorization.
- Keep the CLI independent. A future CLI-to-cloud flow will use explicit, revocable credentials and
  versioned APIs rather than importing web code or reusing browser sessions.

## Consequences

Better Auth gives MaruCheck direct control over its authentication data and a clear path to
organization policies and machine credentials. The tradeoff is operational responsibility: the
application must maintain migrations, email verification and password recovery delivery, secret
rotation, abuse controls, and auth upgrades.

Email delivery is deliberately not coupled to the first migration. Organization owners can create a
single-use invitation link now. Before public production sign-up, select an email provider and wire
verification, password reset, and invitation messages into Better Auth.

## Alternatives considered

### Neon Auth

Neon Auth reduces initial operational work and keeps identity data close to Postgres. It was not
selected because the current product roadmap needs application-owned extensions and may require
custom Better Auth plugins and handlers for CLI/API authentication.

### Clerk or Supabase Auth

Both offer polished managed authentication. They would add another identity control plane and make
the chosen Neon-plus-Drizzle data boundary less cohesive for this stage of the product.
