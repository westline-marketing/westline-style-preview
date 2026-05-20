---
type: code-map
project: westline-style-selector
updated: 2026-05-11
tags: [code-map]
---

# Code map

This note is the fastest way for a fresh agent to understand the codebase. Keep it factual and repo-backed. For existing project backfills, mark anything unknown instead of guessing.

## Repo shape

- `src/` - package source.
- `src/index.ts` - server-safe public API for `@westline/style-selector`.
- `src/client.ts` - client-only public API for `@westline/style-selector/client`.
- `src/types/` - public TypeScript contracts.
- `src/core/` - DOM application, persistence, prepaint script generation, validation, namespace, radius parsing, and constants.
- `src/themes/` - built-in drawer themes, color utilities, and swatch-based drawer theme derivation.
- `src/react/` - React components and hooks for the trigger, drawer, preset cards, logo, prepaint component, and runtime state.
- `examples/` - copyable consumer-side preset/config example; excluded from package build and not shipped.
- `demo/` - static HTML comparison demo generator/server. `demo/dist/*.html` is tracked sample output.
- `.github/workflows/publish.yml` - npm publish workflow for `v*` tags.
- `dist/` - build output present locally but ignored at repo root.
- `vault/` - Obsidian memory added during the 2026-05-11 backfill.

## Primary entrypoints

- Package root export: `src/index.ts`.
- Package client subpath: `src/client.ts`.
- Server-safe React component: `src/react/PrepaintScript.tsx`.
- Client runtime component: `src/react/StyleSelector.tsx`.
- Runtime hook: `src/react/use-style-selector.ts`.
- Demo CLI/server: `node demo/serve.js` serves one page per preset on ports `3001` through `3004`.
- Release workflow: `.github/workflows/publish.yml` on git tags matching `v*`.

## Routes and pages

- No app routes, pages, or API handlers exist in this package repo.
- Consuming apps mount `PrepaintScript` before their themed wrapper and `StyleSelector` after it.
- Query parameters used by the package:
  - `previewStyle` by default for selecting a preset.
  - `previewDrawer` in development for static drawer theme preview (`techie`, `studio`, or `rustic`).

## Components and modules

- `src/core/apply-theme.ts` - collects preset variable keys, applies allowed CSS custom properties, clears default overrides, and sets `data-preview-style`.
- `src/core/constants.ts` - default storage/query names and z-index/transition constants.
- `src/core/namespace.ts` - resolves `instanceId`, legacy `storageKey`, and prepaint style IDs.
- `src/core/persistence.ts` - reads URL/session state, writes session state, clears URL state, and migrates legacy storage.
- `src/core/prepaint.ts` - generates the inline prepaint script and escapes values for safe embedding.
- `src/core/validate.ts` - validates preset shape and allowed tokens; warns in dev when non-default presets lack enough swatches.
- `src/core/parse-radius.ts` - accepts unitless and `px` radius values only.
- `src/themes/index.ts` - built-in drawer themes and drawer theme resolution.
- `src/themes/derive.ts` - derives a readable drawer chrome from preset swatches.
- `src/themes/color-utils.ts` - hex parsing, interpolation, WCAG luminance/contrast, and accent foreground selection.
- `src/react/PreviewTrigger.tsx` - draggable edge trigger with keyboard support and persisted vertical position.
- `src/react/PreviewDrawer.tsx` - modal drawer with focus trap, scroll lock, responsive layout, copy URL action, and reduced-motion support.
- `src/react/PresetCard.tsx` - preset card UI, swatches, active accent bar, and active checkmark.
- `src/react/WestlineLogo.tsx` - embedded Westline logo variants as base64 SVG data URIs.

## Data model

- No database, ORM, migrations, seed data, or backend schema.
- Public contracts:
  - `StylePreset`: `id`, `label`, optional `description`, `variables`, optional `swatches`.
  - `PreviewConfig`: `defaultStyleId`, optional `queryParam`, optional legacy `storageKey`, optional `instanceId`, `targetSelector`, `presets`, optional `allowedTokens`, optional `drawerTheme`, optional `uiTheme`.
  - `PreviewUITheme`: drawer chrome colors, fonts, optional radius/shadow/dark flag.
  - `DrawerThemeName`: `auto`, `techie`, `studio`, `rustic`.
- Storage contracts:
  - Active preset uses `sessionStorage`.
  - Trigger Y position uses `localStorage`.
  - Default storage namespace is `wm-preview`.
- Swatch convention for auto drawer derivation: `[bg, surface, text, accent, border]`.

## External services

- npm registry for package publish/install.
- GitHub Actions for publishing on version tags.
- GitHub repo: `westline-marketing/westline-style-selector`, public.
- Peer dependency integrations are React and React DOM.
- Browser APIs are used directly; no SDK integrations, webhooks, auth providers, or dashboards were found.

## Environment variables

- `NEXT_PUBLIC_ENABLE_STYLE_SELECTOR` - consumer-side build-time gate used by `PrepaintScript` and `StyleSelector` when no explicit `enabled` prop is passed.
- `NODE_ENV` - production/development behavior for validation warnings and `previewDrawer` dev override.
- `NODE_AUTH_TOKEN` - npm publish token env in GitHub Actions.
- `NPM_TOKEN` - GitHub Actions secret referenced by the publish workflow.

## Commands

- Install dependencies: `npm ci` for clean installs; `npm install` for normal local dependency updates.
- Typecheck: `npm run typecheck`.
- Build package: `npm run build`.
- Test: `npm test`.
- Watch tests: `npm run test:watch`.
- Prepare hook: `npm run prepare` runs the build.
- Release artifact check: `npm run release:check` (`npm pack --dry-run`).
- Generate local package tarball: `npm pack`.
- Demo server: `node demo/serve.js`.
- Vault doctor: `WM_PROJECTS_DIR="$PWD" ~/bin/wm-vault-doctor.sh`.

## Tests and verification

- Vitest includes `src/**/*.test.ts` and `src/**/*.test.tsx`, excluding `dist`, `node_modules`, and `examples`.
- jsdom is configured specifically for `src/core/persistence.test.ts`; some React tests also exercise components without a browser app.
- Backfill verification on 2026-05-11:
  - `npm test` passed `13` files and `281` tests.
  - `npm run typecheck` exited successfully.
- Important tested areas include namespace resolution, storage migration, prepaint serialization safety, allowed token enforcement, radius parsing, drawer theme derivation, color contrast helpers, drawer behavior, trigger behavior, preset cards, prepaint component, and logo variants.

## Deployment

- Deployment target is npm package publication.
- GitHub Actions workflow triggers on tags matching `v*`.
- Publish workflow uses Node 20, `npm ci`, `npm test`, `npm run build`, and `npm publish --access public --provenance`.
- Package metadata:
  - Name: `@westline/style-selector`.
  - Version: `0.1.4`.
  - `private: false`.
  - `publishConfig.access: public`.
  - `license: UNLICENSED`.
  - Published files: `dist`, `README.md`, `GUIDE.md`.
- Git tags found: `v0.1.0`, `v0.1.1`, `v0.1.2`, `v0.1.3`, `v0.1.4`.
- GitHub Releases found: none.
- PRs/issues found through `gh`: none returned.

## Known fragile areas

- Keep root and client entrypoints separate; the root export must remain server-safe.
- Preserve escaping in `generatePrepaintScript`; it intentionally escapes `<`, `>`, `&`, U+2028, and U+2029.
- Be cautious with storage namespace changes; `instanceId` is primary for new sites and `storageKey` is only for legacy migration.
- Do not bypass `allowedTokens` in prepaint or DOM application.
- Auto drawer derivation should keep text readable on dark and light swatch patterns; read `src/themes/derive.test.ts` before changing it.
- `PreviewDrawer` owns focus trap, body scroll lock, responsive panel sizing, copy URL action, and reduced-motion transitions.
- `PreviewTrigger` owns drag threshold, default Y position, clamping, keyboard activation, and localStorage persistence.
- Mobile preset card descriptions were clipped before `v0.1.4`; preserve the non-shrinking card layout unless tests are updated.
- Docs repeatedly state package install is public and does not require `.npmrc` or `NPM_TOKEN`; avoid reintroducing consumer auth requirements.
