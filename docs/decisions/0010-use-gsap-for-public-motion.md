# ADR-010: Use GSAP for public-site motion

## Status

Accepted

This decision supersedes the no-motion-library portions of
[ADR-004](0004-use-verification-command-public-system.md) and
[ADR-009](0009-use-scroll-led-public-story-and-defer-pricing.md).

## Date

2026-08-22

## Context

The public experience now uses multi-stage editorial compositions and product diagrams whose
entrances and scroll relationships need coordinated timing. The shared CSS reveal observer is
appropriate for documentation content but does not provide a strong enough motion system for the
homepage, Product, and About stories.

## Decision

- Use GSAP with ScrollTrigger for the public hero entrances, section reveals, subtle background
  parallax, and diagram-connection progress.
- Keep product state changes, such as the pressure-sequence readout, deterministic and driven by
  their focused React component rather than by a decorative animation timeline.
- Do not hide content in static CSS while JavaScript loads. GSAP animates from the server-rendered
  state so failed or delayed JavaScript cannot leave text invisible.
- Disable GSAP motion when `prefers-reduced-motion: reduce` is active.
- Scope every animation through `gsap.context()` and revert it during App Router navigation so
  ScrollTrigger instances do not leak between routes.

## Consequences

- The client bundle includes GSAP and ScrollTrigger on public routes.
- Homepage, Product, and About motion has one coordinated implementation instead of unrelated CSS
  timings.
- Documentation and other simpler public pages may continue using the lightweight reveal observer.
- Performance review should watch the public-route JavaScript budget and keep animations limited to
  transform and opacity where possible.
