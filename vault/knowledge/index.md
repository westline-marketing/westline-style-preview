---
type: knowledge-index
project: westline-style-selector
updated: 2026-05-11
tags: [knowledge]
---

# Knowledge index

This is the map of durable project knowledge compiled from sessions, source captures, research, decisions, and codebase work. Link only notes that are useful for future agents.

## Core project knowledge

- `@westline/style-selector` is a public npm package owned by the repo `westline-marketing/westline-style-selector`.
- The package is a reusable staging/preview style picker engine for Westline client sites. Site-specific presets and config stay in consuming repos.
- Current local package version is `0.1.4`; tags exist from `v0.1.0` through `v0.1.4`.
- GitHub repo metadata showed no GitHub Releases, PRs, or issues during the 2026-05-11 backfill.
- See [[04-code-map]] for entrypoints, module map, commands, tests, env vars, deployment, and fragile areas.

## Product and client knowledge

- Client is best recorded as Westline Marketing internal/shared package; no external client owner is evidenced in this repo.
- Bills Truck & Equipment Sales is named in root `CLAUDE.md` as the reference implementation that seeded the package.
- The package's user-facing intent is client design-direction selection on staging/preview sites, not production end-user styling.

## Technical knowledge

- Root export stays server-safe; client UI comes from `@westline/style-selector/client`.
- New integrations should use `instanceId`; `storageKey` exists for legacy migration.
- `drawerTheme: 'auto'` is the documented default for most integrations; named themes intentionally lock the drawer chrome.
- `NEXT_PUBLIC_ENABLE_STYLE_SELECTOR` is the consumer-side build-time gate unless an explicit `enabled` prop is used.
- Publish workflow uses npm provenance on `v*` tags.
- Repeatable procedures: [[local-dev]], [[deploy]].
- Backfilled decisions:
  - [[2026-04-18-publish-as-public-npm-package]]
  - [[2026-04-18-separate-server-and-client-entrypoints]]
  - [[2026-04-18-use-auto-drawer-theme-by-default]]
  - [[2026-04-18-use-instance-id-for-preview-storage]]

## Research syntheses

- None.

## Open knowledge gaps

Use this section for facts a future agent should verify instead of assuming.

- Current npm registry latest version was not checked during backfill.
- Release owner/steward is not documented in the repo.
- Downstream consumer repos are not listed here.
- Whether GitHub Releases should accompany version tags is not documented.
