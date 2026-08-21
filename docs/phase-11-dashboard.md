# Phase 11 dashboard foundation

The hosted dashboard answers one primary question: **Can this release ship, and what proof supports that decision?**

## Implemented surfaces

| Surface             | Route                  | Purpose                                                               |
| ------------------- | ---------------------- | --------------------------------------------------------------------- |
| Overview            | `/dashboard`           | Release decision, proof orbit, findings, activity, and project health |
| Projects            | `/projects`            | Connected repository health and coverage                              |
| Project detail      | `/projects/[slug]`     | Project gate, runs, findings, and contract coverage                   |
| Connect project     | `/projects/connect`    | GitHub connection and local-execution boundary                        |
| Contracts           | `/contracts`           | Approval state, protected intent, versions, owners, and coverage      |
| New contract        | `/contracts/new`       | Draft creation surface                                                |
| Runs                | `/runs`                | Verification history with commit, risk, evidence, and status          |
| Run detail          | `/runs/[id]`           | Gate, plan, and evidence bundle                                       |
| Findings            | `/findings`            | Severity-ordered release issues                                       |
| Finding detail      | `/findings/[id]`       | Expected versus actual behavior, reproduction, owner, and artifacts   |
| Coverage            | `/coverage`            | Feature-to-requirement-to-evidence mapping                            |
| QA memory           | `/memory`              | Search and filtering for historical failures and regression links     |
| New memory          | `/memory/new`          | Historical record creation surface                                    |
| Production feedback | `/feedback`            | Aggregated failures and pending QA-memory review queue                |
| Feedback detail     | `/feedback/[id]`       | Structured evidence, linkage, and reviewer checkpoint                 |
| Organization        | `/organization`        | Members, workspace metadata, and hosted data boundary                 |
| Invite member       | `/organization/invite` | Owner-only Better Auth invitation flow and shareable link             |
| Accept invite       | `/accept-invitation`   | Authenticated invitation acceptance                                   |
| Sign in             | `/sign-in`             | Better Auth email/password and optional GitHub authentication         |

All product routes use Server Components except active navigation and the one-time project-token
result. Dynamic project, run, and finding routes resolve organization-scoped records at request
time.

## Public product site

The dashboard now sits behind a complete public experience rather than occupying the root route:

| Surface           | Route                     | Purpose                                                   |
| ----------------- | ------------------------- | --------------------------------------------------------- |
| Landing page      | `/`                       | Positioning, proof-loop narrative, capabilities, and CTAs |
| Product           | `/product`                | Detailed contract-to-evidence product model               |
| Pricing           | `/pricing`                | Honest preview, private-beta, and design-partner stages   |
| About             | `/about`                  | Maru name, circle identity, and product principles        |
| Documentation     | `/docs`                   | Documentation map and proof-loop overview                 |
| Getting started   | `/docs/getting-started`   | Current source-based CLI setup                            |
| Quality Contracts | `/docs/quality-contracts` | Durable behavior-contract guidance                        |
| CI integration    | `/docs/ci`                | Pull-request gate and evidence-handling guidance          |
| MCP workflow      | `/docs/mcp`               | Codex and client-neutral MCP operating model              |

The redesigned public site uses a verification-command visual system grounded in the implemented CLI, Quality Contracts, deterministic risk, QA memory, semantic drift, MCP tools, and hosted release evidence. The signature hero is an animated verification deck rather than a generic screenshot or card composition. Product, Pricing, About, and Docs use the same command-system hierarchy.

Motion uses CSS choreography and one small Intersection Observer client component. Navigation and the interactive CLI example are focused client islands. The site respects reduced-motion preferences and does not add an animation library to the client bundle.

## Visual language

Maru means circle, and the circle is used in Japan to mark an answer correct. The product applies that meaning through:

- a double-ring brand mark;
- a proof orbit connecting quality score, coverage, and the current gap;
- single and double circles for drafts, approved contracts, and historical memory;
- coral interruption points when the proof loop is incomplete;
- calm evidence surfaces around the one signature visualization.

The authenticated dashboard retains the proof-orbit language. The public website now treats the Kobayashi Maru influence as a subtle pressure-test mindset through scanning, diagnostic sequences, and calm red-alert states without copying franchise visuals. See [ADR-002](decisions/0002-use-proof-orbit-dashboard-system.md) and [ADR-004](decisions/0004-use-verification-command-public-system.md).

## Data boundary

Better Auth now persists users, sessions, organizations, members, and invitations in Neon Postgres through the official Drizzle adapter. Product routes enforce a session in their server layout, while workspace queries resolve the signed-in user's real organization and role.

`src/lib/dashboard-data.ts` is now an authorized Neon/Drizzle repository for:

1. projects and project-scoped ingestion credentials;
2. Quality Contracts and immutable version storage;
3. verification runs, findings, evidence, requirement coverage, and QA memory;
4. immutable production-event deliveries, aggregated failures, audit history, and review candidates.

Every dashboard read resolves the signed-in workspace inside the repository and selects only the
fields the pages need. Mutations repeat the organization scope. CI uses a separate hashed bearer
token bound to one project; it never reuses a browser session. `POST /api/v1/ingest/runs` accepts a
bounded schema-versioned envelope containing the real CLI verification report. See the
[ingestion API guide](api/verification-ingestion.md) and
[ADR-005](decisions/0005-store-organization-scoped-proof-metadata.md).

`POST /api/v1/production-events` accepts a separate 256 KB generic event envelope under the same
project-token boundary. Exact retries do not increment occurrences, altered reuse returns a
conflict, and matching fingerprints aggregate. The dashboard requires a human root-cause review
and a concrete repository test link before creating active QA Memory. See the
[production-feedback guide](api/production-feedback.md) and
[ADR-006](decisions/0006-ingest-bounded-production-feedback-as-reviewable-memory.md).

The connect flow reveals the raw credential once with a copy control. Each project page continues
to show safe token metadata even before its first report: prefix, status, creation, expiry, and last
use. Owners can revoke a credential or rotate it; rotation revokes the previous active token and
reveals the replacement once.

Project creation plus token creation and report ingestion use short WebSocket-backed transactions.
Parallel dashboard reads use Neon HTTP. The cloud stores normalized metadata and configured
artifact references only; source execution remains local or in CI.

## Run locally

```bash
npm install
npm run db:migrate
npm run dev
```

Create `.env.local` from `.env.example` before running the migration. Open `http://localhost:3000` for the public site, `http://localhost:3000/sign-in` to create the first owner and workspace, or `http://localhost:3000/dashboard` for the protected product overview.

## Validation

```bash
npm run check
```

The production build keeps public and authentication routes optimized while protected product
routes render against the current session and organization.

Vitest covers the production-feedback parser, replay decisions, reviewer input, and HTTP boundary.
Database-backed isolation and browser automation remain private-beta hardening work. In the current
managed environment, installed Chromium processes were previously blocked by the Windows sandbox.
