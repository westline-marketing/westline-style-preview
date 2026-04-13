# @westline/style-preview

This is a portable style preview feature shipped as an npm package. When a user asks you to integrate this into a project, follow these instructions.

## What This Is

A staging-only feature that adds a draggable edge tab + drawer to a themed website so clients can switch between color presets and pick a design direction. It overrides CSS custom properties on a theme wrapper class. Gated behind `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true` (or an explicit `enabled` prop) — renders nothing without it. Requires React 18+ (uses `useSyncExternalStore` for hydration-safe state). Accessible: full keyboard navigation, `prefers-reduced-motion` support on the trigger, and contrast-safe accent foregrounds on CTA buttons.

## How to Implement Into a Target Project

When asked to add style preview to a project, do the following:

### 1. Install the package
- Run `npm install @westline/style-preview` in the target project
- If pulling from a private registry, make sure the target repo has an `.npmrc` with `NPM_TOKEN` configured

### 2. Discover the target project's theme
- Read the target project's `globals.css` (or equivalent) to find the theme wrapper class (e.g., `.theme-storefront`) and its CSS custom properties (e.g., `--bg`, `--text`, `--accent`)
- Read the layout file that wraps the themed content (e.g., `src/app/(frontend)/layout.tsx`)
- Note the existing z-index values used by the header/nav (the trigger must sit below them)

### 3. Create project-specific presets
- Create `src/preview-styles/presets/[surface].ts` in the target project
- Define a typed token allowlist matching the CSS custom properties from step 2
- Create 4 presets: default (empty `variables: {}`) + 3 meaningfully distinct alternates
- Each alternate should vary warmth, lightness, AND accent color — not just shades
- All presets must pass WCAG AA contrast (4.5:1 for body text)
- Include `swatches` array for each preset: `[bg, surface, text, accent, border]`

### 4. Create local config
- Create `src/preview-styles/config.ts` wiring presets to the theme wrapper class
- Include `allowedTokens` from the token allowlist
- Use `instanceId` (not `storageKey`) for new sites
- Set `drawerTheme` to `'auto'` (or omit it -- `'auto'` is the default). This is the correct choice for almost all integrations -- the drawer will recolor its chrome to match the active preset's swatches. Only use `'studio'`, `'techie'`, or `'rustic'` if you intentionally want the drawer locked to a single appearance regardless of which preset the user selects. Do not choose a named theme to "match the site's vibe" -- `auto` handles that through swatch derivation.
- Use `uiTheme` only when you want to override the drawer chrome entirely; it takes precedence over auto and built-in themes
- Add dev-mode `validatePreset()` check at module load time

### 5. Mount components in layout
- Import `PrepaintScript` from `@westline/style-preview` (server-safe root)
- Import `StylePreview` from `@westline/style-preview/client` (client subpath)
- Add `<PrepaintScript config={...} />` BEFORE the theme wrapper div
- Add `<StylePreview config={...} />` AFTER the theme wrapper div
- Import config from `@/preview-styles/config`

### 6. Set environment flag
- Add `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true` to `.env.local`
- Add the same line to `.env.example` if it exists
- On Vercel/Railway this is a build-time flag — changing it requires a rebuild
- Non-Next consumers can pass `enabled={yourFlag}` directly on both components instead

### 7. Token audit
- Search target project components for hardcoded hex values matching theme tokens
- Convert `rgba(R,G,B, alpha)` to `color-mix(in srgb, var(--token) N%, transparent)`
- Leave status colors, black overlays, and CSS fallback values hardcoded
- Focus on high-visibility UI: header, nav, cards, hero, footer

### 8. Verify
- Run typecheck (`tsc --noEmit` or equivalent)
- Confirm zero new type errors from the feature

## Detailed Reference
- See `GUIDE.md` in this repo for the complete integration guide with code templates
- See `README.md` for the package API reference
- Three built-in drawer themes: `studio` (light), `techie` (dark), `rustic` (warm dark)
- Default drawer behavior is `auto`, which starts from the Studio base theme and lets `StylePreview` derive drawer chrome from non-default preset swatches when available
- Auto-derive caveat: the default preset uses the base theme as-is (no swatch derivation); non-default presets derive drawer chrome from their swatches
- Trigger is draggable along the viewport edge; position persists in localStorage keyed by `instanceId`
- Active preset is indicated by an accent bar on its card
- Border-radius scales dynamically from theme tokens
- Dev-mode: append `?previewDrawer=techie` to any URL to preview the static built-in drawer themes without editing config
- Bills Truck & Equipment Sales was the reference implementation that seeded this package

## Parallelization
Use 5-6 parallel agents when implementing:
- Agent 1: Install the package + verify NPM_TOKEN / registry config
- Agent 2: Discover project theme (read globals.css, layout, components)
- Agent 3: Create presets with WCAG-compliant colors
- Agent 4: Create config + mount components in layout + set env flag
- Agent 5: Token audit on site components
- Agent 6: Typecheck + verify
