---
type: project-context
project: westline-style-selector
client: Westline Marketing
status: active
created: 2026-05-11
tags: [project, westline]
---

# Project context

## Client

Westline Marketing internal/shared package. No external client owner is evidenced in the repo.

## Goals

- Provide `@westline/style-selector`, a reusable style selector engine for Westline client sites.
- Let a staging or preview site expose a draggable edge trigger and drawer so clients can compare color preset directions on the real site.
- Keep the shared picker engine in this package while each consuming site keeps its own `src/style-selector/config.ts` and `src/style-selector/presets/*.ts`.
- Preserve server-safe usage for Next.js by exporting `PrepaintScript` from the root package and client-only UI from `@westline/style-selector/client`.

## Constraints

- Feature is intended for staging/preview use and is gated by `NEXT_PUBLIC_ENABLE_STYLE_SELECTOR=true` unless an explicit `enabled` prop is passed.
- Consumers need React 18+ or 19 via peer dependencies.
- Consuming sites must already use CSS custom properties on a theme wrapper class and should keep token allowlists local.
- Presets should pass WCAG AA body text contrast; the package handles foreground choice for accent-colored package UI.
- Public install does not require `.npmrc`, `NPM_TOKEN`, or registry authentication.
- No product intent beyond the package docs and source is assumed.

## Stack

- TypeScript ESM package.
- React components and hooks.
- Vitest test suite with jsdom where browser APIs are needed.
- npm package distribution with GitHub Actions publish workflow.

## Key links

- GitHub: https://github.com/westline-marketing/westline-style-selector
- Package name: `@westline/style-selector`
- Local docs: `README.md`, `GUIDE.md`, `CHANGELOG.md`, `PROMPT-TEMPLATE.md`
- Package entrypoints: `src/index.ts`, `src/client.ts`
- Related memory: [[02-architecture]], [[04-code-map]], [[tasks]], [[handoff]]
