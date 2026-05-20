---
type: architecture
project: westline-style-selector
status: accepted
tags: [architecture]
---

# Architecture

Backfilled from `package.json`, `README.md`, `GUIDE.md`, `CHANGELOG.md`, `.github/workflows/publish.yml`, source files under `src/`, tests, and local git history through `c7e85ee`.

## Stack

- TypeScript package with `type: "module"` and NodeNext module resolution.
- React UI components support React `^18.2.0 || ^19.0.0` as peer dependencies.
- Package build emits declarations and JavaScript to `dist/` via `tsc -p tsconfig.build.json`.
- Tests run with Vitest; jsdom is used for browser-storage tests.
- Published package includes `dist`, `README.md`, and `GUIDE.md`.

## Runtime shape

- Root export `@westline/style-selector` is server-safe and exposes types, theme utilities, `PrepaintScript`, and validation helpers.
- Client export `@westline/style-selector/client` is marked `'use client'` and exposes `StyleSelector`, `useStyleSelector`, and `buildPreviewUrl`.
- `PrepaintScript` generates an inline script that reads `previewStyle` URL state or `sessionStorage` before hydration and injects CSS for allowed preset variables.
- `StyleSelector` portals a trigger and drawer into `document.body`, derives the drawer theme, and uses `useStyleSelector` for preset state and DOM application.
- CSS variables are applied directly to the configured `targetSelector`; the default preset clears package-managed overrides.

## Data model

- No database, migrations, or backend data model.
- Main public contracts are `StylePreset`, `PreviewConfig`, `PreviewUITheme`, `DrawerThemeName`, and `CSSVariableMap` in `src/types/index.ts`.
- `StylePreset.variables` is a CSS custom property map. `allowedTokens` restricts which custom properties can be applied or prepainted.
- `StylePreset.swatches` convention is `[bg, surface, text, accent, border]` and is used by auto drawer theme derivation.
- Active preset persists in `sessionStorage` under `instanceId ?? storageKey ?? wm-preview`.
- Legacy migration supports specifying both `instanceId` and an old `storageKey`; the runtime and prepaint script migrate the stored preset once.
- Trigger vertical position persists in `localStorage` under `<instanceId-or-wm-preview>-tab-y`.

## Auth

- No app auth exists in this repo.
- Package install is public and unauthenticated.
- npm publish authentication is handled by GitHub Actions using the `NPM_TOKEN` repository secret mapped to `NODE_AUTH_TOKEN`.

## Integrations

- React and React DOM are peer dependencies.
- Browser APIs used by the client runtime include `sessionStorage`, `localStorage`, `URLSearchParams`, `MutationObserver`, `matchMedia`, `navigator.clipboard`, and DOM portals.
- GitHub Actions publishes to npm on `v*` tags.
- Consuming Next.js sites commonly gate the feature with `NEXT_PUBLIC_ENABLE_STYLE_SELECTOR`.

## Deployment

- Release/publish target is npm, not a hosted web app.
- `.github/workflows/publish.yml` runs on tag pushes matching `v*`, uses Node 20, runs `npm ci`, `npm test`, `npm run build`, then `npm publish --access public --provenance`.
- Current package version in `package.json` is `0.1.4`; git tags exist for `v0.1.0` through `v0.1.4`.
- GitHub repo metadata reports no GitHub Releases as of the backfill.

## Known risks

- Server/client entrypoint separation matters for Next.js consumers; importing the client subpath from server code can break rendering boundaries.
- Inline prepaint serialization is security-sensitive; escaping in `src/core/prepaint.ts` is covered by tests and should be preserved.
- `allowedTokens` protects consumers from applying unexpected CSS custom properties; broadening it in examples or integrations changes the safety boundary.
- Auto drawer theme derivation depends on exactly five swatches and contrast guards; missing or low-contrast swatches fall back to the base drawer theme.
- `useStyleSelector` handles late-mounted wrapper elements with `MutationObserver`; changes to target detection can affect Suspense/lazy routes.
- Focus trap, body scroll lock, keyboard activation, and reduced-motion behavior are part of the accessibility contract.
- Mobile drawer card layout has a documented regression fix in `v0.1.4`; avoid removing `flex-shrink: 0` behavior without tests.

## Open architecture questions

- Whether npm package `0.1.4` is still the latest registry version was not verified against npm during this backfill.
- No issue tracker or PR history exists in GitHub to explain roadmap or ownership beyond local docs and commits.
- No consumer repo inventory is present here, so active downstream usage is unknown.
