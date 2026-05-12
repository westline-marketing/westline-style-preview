# @westline/style-selector

This is a portable style selector feature shipped as an npm package. When a user asks you to integrate this into a project, follow these instructions.

## What This Is

A staging-only feature that adds a draggable edge tab + drawer to a themed website so clients can switch between color presets and pick a design direction. It overrides CSS custom properties on a theme wrapper class. Gated behind `NEXT_PUBLIC_ENABLE_STYLE_SELECTOR=true` (or an explicit `enabled` prop) — renders nothing without it. Requires React 18+ (uses `useSyncExternalStore` for hydration-safe state). Accessible: full keyboard navigation, `prefers-reduced-motion` support on the trigger, and contrast-safe accent foregrounds on CTA buttons.

## How to Implement Into a Target Project

When asked to add style selector to a project, do the following:

### 1. Install the package
- Run `npm install @westline/style-selector` in the target project
- The package is published publicly on npm — no authentication, `.npmrc`, or `NPM_TOKEN` needed on any machine or CI

### 2. Discover the target project's theme
- Read the target project's `globals.css` (or equivalent) to find the theme wrapper class (e.g., `.theme-storefront`) and its CSS custom properties (e.g., `--bg`, `--text`, `--accent`)
- Read the layout file that wraps the themed content (e.g., `src/app/(frontend)/layout.tsx`)
- Note the existing z-index values used by the header/nav (the trigger must sit below them)

### 3. Create project-specific presets
- Create `src/style-selector/presets/[surface].ts` in the target project
- Define a typed token allowlist matching the CSS custom properties from step 2
- Create 4 presets: default (empty `variables: {}`) + 3 meaningfully distinct alternates
- Each alternate should vary warmth, lightness, AND accent color — not just shades
- All presets must pass WCAG AA contrast (4.5:1 for body text)
- Include `swatches` array for each preset: `[bg, surface, text, accent, border]`

### 4. Create local config
- Create `src/style-selector/config.ts` wiring presets to the theme wrapper class
- Include `allowedTokens` from the token allowlist
- Use `instanceId` (not `storageKey`) for new sites
- Set `drawerTheme` to `'auto'` (or omit it -- `'auto'` is the default). This is the correct choice for almost all integrations -- the drawer will recolor its chrome to match the active preset's swatches. Only use `'studio'`, `'techie'`, or `'rustic'` if you intentionally want the drawer locked to a single appearance regardless of which preset the user selects. Do not choose a named theme to "match the site's vibe" -- `auto` handles that through swatch derivation.
- Use `uiTheme` only when you want to override the drawer chrome entirely; it takes precedence over auto and built-in themes
- Add dev-mode `validatePreset()` check at module load time

### 5. Mount components in layout
- Import `PrepaintScript` from `@westline/style-selector` (server-safe root)
- Import `StyleSelector` from `@westline/style-selector/client` (client subpath)
- Add `<PrepaintScript config={...} />` BEFORE the theme wrapper div
- Add `<StyleSelector config={...} />` AFTER the theme wrapper div
- Import config from `@/style-selector/config`

### 6. Set environment flag
- Add `NEXT_PUBLIC_ENABLE_STYLE_SELECTOR=true` to `.env.local`
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
- Default drawer behavior is `auto`, which starts from the Studio base theme and lets `StyleSelector` derive drawer chrome from non-default preset swatches when available
- Auto-derive caveat: the default preset uses the base theme as-is (no swatch derivation); non-default presets derive drawer chrome from their swatches
- Trigger is draggable along the viewport edge; position persists in localStorage keyed by `instanceId`
- Active preset is indicated by an accent bar on its card
- Border-radius scales dynamically from theme tokens
- Dev-mode: append `?previewDrawer=techie` to any URL to preview the static built-in drawer themes without editing config
- Bills Truck & Equipment Sales was the reference implementation that seeded this package

## Parallelization
Use 5-6 parallel agents when implementing:
- Agent 1: Install the package from the public npm registry (no auth or `.npmrc` needed)
- Agent 2: Discover project theme (read globals.css, layout, components)
- Agent 3: Create presets with WCAG-compliant colors
- Agent 4: Create config + mount components in layout + set env flag
- Agent 5: Token audit on site components
- Agent 6: Typecheck + verify


<!-- BEGIN WM OBSIDIAN BOOTSTRAP -->
## Obsidian bootstrap for westline-style-selector

This project uses vault/ as persistent memory for Claude Code, Codex, and other coding agents.

Session start:
- Claude Code: read this file, then vault/CLAUDE.md.
- Codex: read AGENTS.md, then vault/AGENTS.md and vault/CLAUDE.md.
- Read vault/CLAUDE.md for the canonical vault operating manual + YAML schema.
- Read vault/01-project-context.md for orientation.
- Read vault/02-architecture.md and vault/04-code-map.md for system shape.
- Read vault/03-status.md for current state.
- Read newest file in vault/sessions/.
- Read vault/handoff.md.
- Check vault/tasks.md.
- Read vault/LESSONS.md and vault/knowledge/index.md before non-trivial work.
- For existing repos with thin memory, complete the backfill protocol in vault/CLAUDE.md before major feature work.

Rules:
- Read/write notes with filesystem tools (fast, simple).
- Rename/move linked notes via obsidian move ... to="..." or obsidian rename ... name="..." so Obsidian can preserve wikilinks.
- Never edit vault/.obsidian/ directly.
- No secrets in vault notes; use .env.
- Parallel agents write reports to vault/agent-outbox/; the lead integrates useful findings.
- At wrap-up, update status, handoff, tasks, code map, lessons, and knowledge notes when they changed.
<!-- END WM OBSIDIAN BOOTSTRAP -->
