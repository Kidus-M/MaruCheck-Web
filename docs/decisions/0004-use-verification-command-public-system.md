# ADR-004: Use a verification-command visual system for the public website

## Status

Accepted

This decision supersedes the public marketing portions of
[ADR-002](0002-use-proof-orbit-dashboard-system.md). ADR-002 remains active for the authenticated
dashboard.

## Date

2026-08-18

## Context

The first public website explained the product but relied on familiar SaaS devices: a centered hero,
floating cards, repeated feature grids, and decorative orbits. Those patterns did not communicate
the implemented MaruCheck system or its pressure-testing identity with enough specificity.

MaruCheck already has distinctive artifacts: Git diffs, deterministic risk contributions, reviewed
Quality Contracts, requirement-linked verification plans, local test adapters, complete findings,
immutable QA memory, semantic-drift conflicts, MCP tool calls, and release-gate evidence. The public
site should show those artifacts directly.

## Decision

Adopt a public visual system called **verification command**.

- The signature element is an animated command deck that progresses from an agent-authored code
  change through diff classification, risk, contract comparison, evidence, and a blocked release.
- Use the established MaruCheck ink, paper, indigo, coral, and mint palette. Indigo represents
  active analysis, coral represents verified failure, and mint represents conclusive success.
- Use asymmetric editorial layouts, full-width diagnostic surfaces, sticky explanations, terminal
  output, code diffs, trace lines, and status-led tables. Avoid using a grid of rounded cards as the
  default structure.
- Treat the Kobayashi Maru influence as a pressure-test mindset expressed through calm command
  interfaces and red-alert failure states. Do not use franchise imagery, typography, symbols, or
  narrative elements.
- Keep pages as Server Components. Limit client JavaScript to the responsive navigation, scroll
  reveal observer, and interactive CLI example.
- Implement motion with CSS and one shared Intersection Observer. Every animation must communicate
  scanning, sequence, progress, status, or causality and must stop under `prefers-reduced-motion`.
- Use actual CLI output, contract identifiers, MCP tool names, dashboard data, and acceptance
  scenarios from the repositories. Do not invent capabilities or hide current product availability.

## Alternatives considered

### Polish the existing proof-orbit marketing site

This would preserve too much of the generic hero-plus-cards structure the redesign needed to remove.
The proof orbit remains useful inside the release dashboard but is no longer the primary public-site
metaphor.

### Adopt a dark developer-tool template

A black canvas, glow effects, and generalized code cards would match the category but not the
product. The chosen system instead derives its visuals from MaruCheck's own verification artifacts
and uses coral only when a real failure is present.

### Add a motion or component library

The required interactions are small and deterministic. CSS animation and focused client islands
avoid a large dependency and preserve server-rendered content and reduced-motion behavior.

## Consequences

- The homepage explains the complete product loop visually within the first viewport and through
  the scroll narrative.
- Public Product, Pricing, About, and Docs routes share one coherent command-system language.
- Marketing examples must remain synchronized with the CLI and dashboard models as those evolve.
- Visual QA should include desktop and mobile screenshots when browser automation is available.
