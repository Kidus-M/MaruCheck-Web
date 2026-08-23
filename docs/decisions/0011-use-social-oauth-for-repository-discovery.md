# ADR-011: Use social OAuth for repository discovery

- Status: Accepted
- Date: 2026-08-23

## Context

The hosted product already used Better Auth for email/password identity and optional GitHub sign-in,
but project connection required people to type a display name, `owner/repository`, and default
branch. That duplicated data GitHub already owns and allowed stale or mistyped repository metadata.
MaruCheck also needs Google sign-in without creating a second authentication system.

Repository discovery requires a GitHub user token. GitHub OAuth Apps can provide that token through
the existing Better Auth account record, but their private-repository `repo` scope is broad and is
not read-only. A GitHub App can provide fine-grained repository metadata permission, but adds an
installation lifecycle, installation-token exchange, and a separate user-to-installation mapping.

## Decision

- Configure GitHub and Google as optional Better Auth social providers. Email/password remains
  available.
- Encrypt OAuth access, refresh, and ID tokens through Better Auth before storing them in Postgres.
- Keep GitHub sign-in on Better Auth's default identity scopes (`read:user` and `user:email`).
- Load up to 100 recently pushed repositories through `GET /user/repos` in a Server Component. Do
  not serialize the provider token into client props.
- Allow users to link GitHub from the project connection page when they signed in with Google or
  email/password. Keep Better Auth's same-verified-email linking requirement.
- Request GitHub's broad `repo` scope only through a separate **Include private repositories** action
  with explanatory copy.
- Send only the selected `owner/repository` value from the browser. Re-fetch the linked account's
  repository list and derive the project name and default branch inside the authorized Server
  Action before writing the project and its ingestion token.
- Continue applying MaruCheck's open, allowlisted, or locked signup policy to first-time social
  identities.

## Consequences

Project connection no longer trusts manually entered GitHub metadata, and GitHub/Google sign-in use
the same user, session, organization, and policy system as email/password. Provider tokens stay on
the server and are encrypted at rest at the application layer.

Public repository discovery needs no repository-content permission. Users who need private
repositories must accept GitHub OAuth's broad `repo` permission. This is acceptable for the current
developer-testing stage because it is explicit and optional, but it is not the desired long-term
permission model for a public multi-tenant service.

The picker intentionally caps the initial result at 100 recently pushed repositories. Pagination or
server-side search can be added when real accounts demonstrate that the cap is insufficient.

## Alternatives considered

### Keep manual repository entry

This avoids provider API access but preserves typo, stale-branch, and impersonation risks. It was
rejected because the user explicitly authorizes GitHub and expects GitHub to remain authoritative
for repository identity.

### Request `repo` during every GitHub sign-in

This would make private repositories immediately visible, but asks for broad repository access from
people who only want authentication. It was rejected in favor of incremental, explicit consent.

### Implement a GitHub App immediately

A GitHub App is the preferred future design for fine-grained, installation-scoped metadata access.
It was deferred because the current feature needs repository discovery, not webhook automation or
repository writes, and the additional installation model would materially expand the release. Move
to a GitHub App before making private-repository integration a default public capability.
