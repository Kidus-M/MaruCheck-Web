# ADR-012: Open source the public repositories under MIT

## Status

Accepted

This decision resolves the licensing uncertainty recorded in
[ADR-009](0009-use-scroll-led-public-story-and-defer-pricing.md).

## Date

2026-08-23

## Context

MaruCheck asks developers to trust a system that interprets product intent and preserves release
evidence. The implementation behind that judgment should be inspectable. The local CLI and hosted
application already have separate repositories and release lifecycles; neither needs to be hidden
to preserve that boundary.

The CLI is distributed as the unscoped `marucheck` package on npm. GitHub's npm registry would
require a scoped package identity, creating a second install path with different configuration.
The project also has no approved pricing model, so open-source status must not imply invented hosted
service tiers.

## Decision

- License both the MaruCheck CLI and MaruCheck Web repositories under the MIT License, copyright
  2026 Kidus Mesfin Teferi.
- Keep the repositories independent: CLI changes publish on their own versioned release train;
  hosted application changes deploy through the web production workflow.
- Treat npm as the canonical CLI package registry and GitHub Releases as the release-notes and
  downloadable-artifact surface.
- Add an Open source route, visible navigation, source links, license links, and contribution calls
  to the public site and documentation.
- Keep pricing absent until actual commercial terms exist. An MIT source license does not promise
  free hosted infrastructure, support, or indefinite service availability.

## Consequences

- Developers can inspect the verifier before putting it in a release path and can contribute to the
  repository that owns the relevant behavior.
- Public messaging clearly separates local open-source execution from the optional hosted proof
  console.
- Contributors have one CLI package name and do not need GitHub Packages authentication or registry
  configuration.
- Documentation and marketing must update the pinned CLI version together at every public release.

## Alternatives considered

### Open only the CLI

Rejected because the hosted report boundary, authentication, and dashboard evidence model also
benefit from public inspection, and the two-repository structure already prevents nested releases.

### Mirror the CLI to GitHub Packages

Rejected because the required scoped package would fragment installation and documentation without
adding a distinct supported artifact.

### Add pricing with the open-source launch

Rejected because no commercial offering or service guarantee has been approved.
