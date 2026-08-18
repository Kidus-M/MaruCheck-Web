# Phase 11 dashboard foundation

The hosted dashboard answers one primary question: **Can this release ship, and what proof supports that decision?**

## Implemented surfaces

| Surface | Route | Purpose |
| --- | --- | --- |
| Overview | `/` | Release decision, proof orbit, findings, activity, and project health |
| Projects | `/projects` | Connected repository health and coverage |
| Project detail | `/projects/[slug]` | Project gate, runs, findings, and contract coverage |
| Connect project | `/projects/connect` | GitHub connection and local-execution boundary |
| Contracts | `/contracts` | Approval state, protected intent, versions, owners, and coverage |
| New contract | `/contracts/new` | Draft creation surface |
| Runs | `/runs` | Verification history with commit, risk, evidence, and status |
| Run detail | `/runs/[id]` | Gate, plan, and evidence bundle |
| Findings | `/findings` | Severity-ordered release issues |
| Finding detail | `/findings/[id]` | Expected versus actual behavior, reproduction, owner, and artifacts |
| Coverage | `/coverage` | Feature-to-requirement-to-evidence mapping |
| QA memory | `/memory` | Search and filtering for historical failures and regression links |
| New memory | `/memory/new` | Historical record creation surface |
| Organization | `/organization` | Members, workspace metadata, and hosted data boundary |
| Invite member | `/organization/invite` | Role-aware invitation surface |
| Sign in | `/sign-in` | Provider-neutral authentication experience |

All product routes use Server Components except active navigation. Dynamic project, run, and finding routes use static parameters for the current demonstration repository.

## Visual language

Maru means circle, and the circle is used in Japan to mark an answer correct. The product applies that meaning through:

- a double-ring brand mark;
- a proof orbit connecting quality score, coverage, and the current gap;
- single and double circles for drafts, approved contracts, and historical memory;
- coral interruption points when the proof loop is incomplete;
- calm evidence surfaces around the one signature visualization.

The design draws interaction lessons from Linear, Vercel, and Stripe but does not reproduce their brand styling. See [ADR-002](decisions/0002-use-proof-orbit-dashboard-system.md).

## Data boundary

`src/lib/dashboard-data.ts` defines the metadata types used by the hosted product and exposes a server-only repository function. It currently returns deterministic demonstration data so the UI, route hierarchy, and component contracts can be completed before choosing providers.

Replace that function with an authorized PostgreSQL data-access layer after selecting:

1. authentication and organization management;
2. PostgreSQL hosting;
3. ORM and migration tooling.

The implementation must validate a session close to each data query and mutation, return only the fields required by the page, and never treat layout visibility as authorization.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The sign-in design is at `http://localhost:3000/sign-in`.

## Validation

```bash
npm run check
```

The production build prerenders the overview, lists, sign-in, organization, coverage, memory, and form routes. It also generates the demonstration project, run, and finding detail routes.

Browser automation is not yet a repository dependency. In the current managed environment, the Playwright CLI was unavailable offline and installed Chromium processes were blocked by the Windows sandbox. Add the selected test tooling before creating screenshot or interaction suites.
