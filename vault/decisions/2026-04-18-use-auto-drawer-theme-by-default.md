---
type: decision
project: westline-style-selector
date: 2026-04-18
status: accepted
supersedes:
tags: [decision]
---

# Use auto drawer theme by default

## Context

`README.md`, `GUIDE.md`, root `CLAUDE.md`, `examples/storefront-presets.ts`, `src/themes/index.ts`, `src/themes/derive.ts`, and theme tests all document `drawerTheme: 'auto'` as the normal choice. Git history includes commits for auto drawer derivation and docs clarifying auto vs locked themes.

## Decision

Use auto drawer behavior as the default integration guidance. Static named themes are reserved for intentional locked drawer appearances.

## Why

Client presentations should make the drawer feel connected to the active preset. Auto mode derives drawer chrome from non-default preset swatches while the default preset falls back to the Studio base theme.

## Alternatives

- Always use one static built-in drawer theme.
- Require every consumer to author a full `uiTheme`.
- Derive drawer UI from CSS variables on the target site without explicit swatches.

## Consequences

- Non-default presets should provide five swatches: `[bg, surface, text, accent, border]`.
- Missing or insufficient swatches fall back to the base theme.
- `uiTheme` still overrides all built-in and auto behavior.
- Named themes (`studio`, `techie`, `rustic`) intentionally lock the drawer chrome.

## Links

- [[04-code-map#Known fragile areas]]
- `README.md`
- `GUIDE.md`
- `src/themes/derive.ts`
- `src/themes/index.test.ts`
- `examples/storefront-presets.ts`
