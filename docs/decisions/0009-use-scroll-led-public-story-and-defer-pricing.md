# ADR-009: Use a scroll-led public story and defer pricing

## Status

Accepted

This decision partially supersedes [ADR-004](0004-use-verification-command-public-system.md).
[ADR-010](0010-use-gsap-for-public-motion.md) supersedes this decision's no-animation-library
constraint.

## Date

2026-08-22

## Context

The verification-command redesign established the right product language, but the homepage still
presented ten similarly weighted sections. The regular cadence, conventional full-width navigation,
small type, and directory-style footer made the site feel assembled from familiar SaaS patterns.

MaruCheck also has no approved pricing model. The project may remain proprietary, become open
source, or adopt a mixed model. Publishing provisional tiers would create a false product promise.

The product name is inspired by the Kobayashi Maru concept: testing a system under difficult and
unexpected conditions rather than merely checking the happy path. Circular interface elements may
support the diagnostic visual language, but they are not the name's etymology.

## Decision

- Make one pressure-test sequence the homepage's visual and narrative spine: patch, approved intent,
  risk, QA memory, and release decision.
- Replace the equal-section rhythm with large editorial statements, a sticky diagnostic instrument,
  a coral semantic-drift interruption, a recalled-regression trace, an MCP exchange, and a local CLI
  proof surface.
- Use a padded floating navigation that contracts after scroll. Order public navigation as Product,
  How it works, Docs, and About; keep account and activation actions separate.
- End with a large proof statement, executable install command, and flat utility rail instead of a
  conventional multi-column link directory.
- Remove the Pricing route and every public Pricing link. Temporarily redirect `/pricing` to
  `/product` so old links do not fail. Restore pricing only after the business and licensing model is
  explicitly approved.
- Keep the established ink, paper, indigo, coral, and mint identity. Implement causal motion with
  CSS and focused browser observers, without adding a component or animation dependency.
- Keep all rendered product claims tied to implemented CLI, MCP, contract, memory, risk, and hosted
  evidence behavior.

## Alternatives considered

### Add more animated component-library sections

This would increase visual novelty but preserve the fragmented page structure. MaruCheck needs one
recognizable interaction that explains the product, not a collection of unrelated effects.

### Publish placeholder pricing

Placeholder tiers would imply commitments that have not been made and would complicate a possible
open-source direction.

### Use a general-purpose motion library

The required state transitions, reveals, and scroll-linked transformations are small enough for CSS
and Intersection Observer. Avoiding a new dependency keeps server-rendered content intact and the
reduced-motion path straightforward.

## Consequences

- The homepage has a stronger scroll narrative and fewer, more differentiated sections.
- The nav and footer are recognizable MaruCheck surfaces rather than generic site chrome.
- The pressure sequence adds one focused client island; its text remains server rendered.
- `/pricing` returns a temporary redirect instead of a page or a 404.
- Future pricing work requires a deliberate product decision and a new or updated ADR.
