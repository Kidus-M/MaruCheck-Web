# Phase 11 dashboard foundation

The hosted dashboard answers one primary question: **Can this release ship, and what proof supports that decision?**

## Implemented surfaces

| Surface         | Route                  | Purpose                                                               |
| --------------- | ---------------------- | --------------------------------------------------------------------- |
| Overview        | `/dashboard`           | Release decision, proof orbit, findings, activity, and project health |
| Projects        | `/projects`            | Connected repository health and coverage                              |
| Project detail  | `/projects/[slug]`     | Project gate, runs, findings, and contract coverage                   |
| Connect project | `/projects/connect`    | GitHub connection and local-execution boundary                        |
| Contracts       | `/contracts`           | Approval state, protected intent, versions, owners, and coverage      |
| New contract    | `/contracts/new`       | Draft creation surface                                                |
| Runs            | `/runs`                | Verification history with commit, risk, evidence, and status          |
| Run detail      | `/runs/[id]`           | Gate, plan, and evidence bundle                                       |
| Findings        | `/findings`            | Severity-ordered release issues                                       |
| Finding detail  | `/findings/[id]`       | Expected versus actual behavior, reproduction, owner, and artifacts   |
| Coverage        | `/coverage`            | Feature-to-requirement-to-evidence mapping                            |
| QA memory       | `/memory`              | Search and filtering for historical failures and regression links     |
| New memory      | `/memory/new`          | Historical record creation surface                                    |
| Organization    | `/organization`        | Members, workspace metadata, and hosted data boundary                 |
| Invite member   | `/organization/invite` | Owner-only Better Auth invitation flow and shareable link             |
| Accept invite   | `/accept-invitation`   | Authenticated invitation acceptance                                   |
| Sign in         | `/sign-in`             | Better Auth email/password and optional GitHub authentication         |

All product routes use Server Components except active navigation. Dynamic project, run, and finding routes use static parameters for the current demonstration repository.

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

The public site uses lightweight CSS choreography and one small Intersection Observer client component. It respects reduced-motion preferences and does not add an animation library to the client bundle.

## Visual language

Maru means circle, and the circle is used in Japan to mark an answer correct. The product applies that meaning through:

- a double-ring brand mark;
- a proof orbit connecting quality score, coverage, and the current gap;
- single and double circles for drafts, approved contracts, and historical memory;
- coral interruption points when the proof loop is incomplete;
- calm evidence surfaces around the one signature visualization.

The design draws interaction lessons from Linear, Vercel, and Stripe but does not reproduce their brand styling. See [ADR-002](decisions/0002-use-proof-orbit-dashboard-system.md).

## Data boundary

Better Auth now persists users, sessions, organizations, members, and invitations in Neon Postgres through the official Drizzle adapter. Product routes enforce a session in their server layout, while workspace queries resolve the signed-in user's real organization and role.

`src/lib/dashboard-data.ts` still returns deterministic demonstration product data. Replace it with an authorized PostgreSQL data-access layer for:

1. projects and source-control connections;
2. immutable contract versions and approvals;
3. verification runs, findings, requirement evidence, and QA memory.

The implementation must validate a session close to each data query and mutation, return only the fields required by the page, and never treat layout visibility as authorization.

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

The production build prerenders the overview, lists, sign-in, organization, coverage, memory, and form routes. It also generates the demonstration project, run, and finding detail routes.

Browser automation is not yet a repository dependency. In the current managed environment, the Playwright CLI was unavailable offline and installed Chromium processes were blocked by the Windows sandbox. Add the selected test tooling before creating screenshot or interaction suites.
