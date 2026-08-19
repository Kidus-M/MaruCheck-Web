# ADR-002: Use a proof-orbit dashboard system and vendor-neutral data boundary

## Status

Accepted

The provider-selection portions of this decision were resolved by
[ADR-003](0003-self-host-better-auth-on-neon.md). The visual and route-system decisions remain active.
The demonstration data boundary was replaced by the organization-scoped repository in
[ADR-005](0005-store-organization-scoped-proof-metadata.md).
The public marketing visual system was later superseded by
[ADR-004](0004-use-verification-command-public-system.md); the proof-orbit decision remains active for
the authenticated dashboard.

## Date

2026-08-18

## Context

Phase 11 introduces the first hosted product surface for MaruCheck. It must cover organizations, projects, contracts, verification runs, findings, requirement coverage, and QA memory without becoming a generic analytics dashboard. The primary audience is an engineering lead, product owner, or QA owner deciding whether a release has enough proof to ship.

The name must inform the interface rather than appear only in a logo. In Japanese usage, a circle (maru) marks an answer as correct; a double circle indicates stronger approval. That meaning fits MaruCheck's role: not merely observing activity, but connecting approved intent, challenged behavior, and evidence into a defensible release decision.

Current highly regarded developer dashboards converge on several useful patterns:

- Linear demonstrates calm, keyboard-oriented density with quiet chrome.
- Vercel prioritizes common workflows in a consistent sidebar and uses a mobile bottom navigation surface.
- Stripe treats tables and exact values as the source of truth, with charts used as summaries rather than decoration.

The implementation plan requires PostgreSQL but does not choose an authentication provider, PostgreSQL host, or ORM. Those choices affect operational ownership, pricing, migrations, and account portability, so they must not be hidden inside a visual implementation.

## Decision

Adopt a light, evidence-first dashboard system called **proof orbit**.

The visual system uses:

- a cool paper canvas, white evidence surfaces, and deep ink navigation;
- indigo for active proof, coral only for release-impacting gaps, mint for conclusive evidence, and ochre for partial coverage;
- Trebuchet/Avenir-style rounded display typography to echo the Maru circle, a neutral system face for reading, and monospace for identifiers and evidence values;
- one signature circular visualization on the overview that shows requirement coverage and the location of a proof gap;
- circle and double-circle marks as a consistent language for contracts, memory, approval, and completeness;
- restrained borders and exact tables rather than decorative gradients or generic KPI charts.

Use this route hierarchy:

```text
Dashboard (/dashboard)
|-- Projects (/projects)
|   |-- Connect (/projects/connect)
|   `-- Project detail (/projects/[slug])
|-- Contracts (/contracts)
|   `-- New draft (/contracts/new)
|-- Runs (/runs)
|   `-- Run detail (/runs/[id])
|-- Findings (/findings)
|   `-- Finding detail (/findings/[id])
|-- Coverage (/coverage)
|-- QA memory (/memory)
|   `-- New record (/memory/new)
|-- Organization (/organization)
|   `-- Invite member (/organization/invite)
`-- Sign in (/sign-in)
```

Keep pages as React Server Components. Limit the initial client boundary to active-route navigation. Use direct imports, exact DTO-style dashboard types, and a server-only `getDashboardSnapshot()` boundary. The current implementation returns typed demonstration metadata. A future authorized PostgreSQL repository can replace that boundary without changing page components.

Do not implement a home-grown production session. ADR-003 implements this requirement with Better
Auth. ADR-005 replaces the original demonstration repository with organization-scoped Postgres
queries. Authorization is enforced in the data-access layer near each query and mutation, not only
in the shared layout.

## Alternatives considered

### Copy Linear's dark interface

Linear is an important density reference, but a dark-first clone would be visually derivative and would weaken the document/evidence character of MaruCheck. Deep ink is reserved for navigation and the release-decision surface; evidence remains readable on light surfaces.

### Use the existing marketing-page visual style unchanged

The original condensed hero and three-step rail communicated the product thesis but did not provide an operational system for dense contracts, findings, and runs. The new system preserves indigo, coral, and the verification sequence while adding product-level hierarchy.

### Build a conventional card-and-chart analytics dashboard

MaruCheck's important relationship is not a trend line. It is `intent -> requirement -> evidence -> gate`. The proof orbit and coverage map visualize that relationship directly, while exact tables remain available for operational detail.

### Select Clerk, Auth.js, Better Auth, or Supabase during UI work

Authentication affects data ownership, organizations, role management, deployment, and recurring cost. This alternative was deferred during visual work and subsequently resolved in ADR-003.

### Pass the entire dashboard snapshot to a client application

That would increase client JavaScript and serialize unrelated organization, project, and finding data. Server-rendered pages consume only the fields they display; the small navigation component is the only initial client island.

## Consequences

### Positive

- The interface has a recognizable Maru-specific identity based on correctness and completion.
- Release status, evidence, and blocking gaps are visible before general analytics.
- All Phase 11 information areas have responsive, linked routes.
- Server Components keep the initial JavaScript boundary small.
- Better Auth and Neon Postgres were added without redesigning the route or component system.
- Desktop sidebar and mobile bottom navigation keep primary areas within one action.

### Negative

- Empty workspaces require intentional onboarding states before the first report is ingested.
- The system font stack is operationally reliable but less typographically identical across platforms than bundled webfonts.

### Neutral

- Product screenshots and visual regression tests should be added once browser automation is installed in the repository.
- Rich command-menu behavior can be added later without moving the route hierarchy into a client-side SPA.
