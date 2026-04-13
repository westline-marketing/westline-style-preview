# Style Preview — Drop-in Prompt for Existing Projects

Copy one of the prompts below into Claude Code when you're inside a project that needs client style direction. The minimal prompt works for most cases — Claude discovers the project details automatically.

---

## Minimal Prompt (recommended)

Paste this as-is. Claude reads the project's globals.css and layout to find everything it needs.

```
Add the Westline style preview feature to this project so the client can
choose between design directions on staging.

Instructions:
1. Install the package:
   npm install @westline/style-preview

2. Read node_modules/@westline/style-preview/GUIDE.md for the full
   integration pattern and code templates.

3. Read this project's globals.css to find the theme wrapper class and CSS
   custom properties (tokens).

4. Read the layout file that wraps the themed content.

5. Create 4 presets in src/preview-styles/presets/[surface].ts
   (default + 3 meaningfully distinct alternates):
   - Default: the current design, empty variables: {}
   - 3 alternates that each take the existing tokens in a clearly different
     direction (vary warmth, lightness, and accent color — not just shades)
   - Each preset must pass WCAG AA contrast (4.5:1 body text)
   - Accent foreground contrast is handled automatically by the package
     (it selects white or dark text on accent backgrounds via luminance),
     so presets can use any accent color without worrying about button text

6. Create src/preview-styles/config.ts with:
   - targetSelector matching the wrapper class
   - presets + allowedTokens
   - instanceId (a stable identifier for this site — do NOT also set storageKey)
   - Always set drawerTheme: 'auto' unless the user explicitly requests a
     fixed drawer. Do not choose a named theme based on site aesthetics --
     'auto' derives the drawer's appearance from the active preset's swatches,
     which is the correct behavior for client presentations. The default preset
     (empty variables) falls back to the Studio base theme. Only use
     'studio' | 'techie' | 'rustic' if you intentionally want the drawer locked
     to a single appearance regardless of which preset is selected.
   - Dev-mode validatePreset check

7. Mount in the layout:
   - import { PrepaintScript } from '@westline/style-preview'
   - import { StylePreview } from '@westline/style-preview/client'
   - <PrepaintScript config={...} /> before the theme wrapper
   - <StylePreview config={...} /> after the theme wrapper
   - The edge trigger tab is draggable (vertical repositioning) and
     keyboard-accessible (Enter/Space to toggle). It respects
     prefers-reduced-motion by disabling transitions.

8. Add NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true to .env.local
   (also add it to .env.example if one exists)

9. Token audit: search components for hardcoded hex values matching theme
   tokens and convert to var() references. Convert token-based rgba(...)
   to color-mix(...) on the same tokens.

10. Typecheck and verify.

Use 5-6 parallel agents where possible to speed up the implementation.
```

---

## Directed Prompt (when you know what you want)

Use this when you have specific preset directions in mind.

```
Add the Westline style preview feature to this project so the client can
choose between design directions on staging.

Instructions:
1. Install the package:
   npm install @westline/style-preview

2. Read node_modules/@westline/style-preview/GUIDE.md for the full
   integration pattern.

3. Read this project's globals.css and layout to find the theme class and tokens.

4. Create these presets in src/preview-styles/presets/[surface].ts:
   - Default: [CURRENT THEME NAME] — empty variables: {}
   - [NAME]: [DESCRIPTION]
   - [NAME]: [DESCRIPTION]
   - [NAME]: [DESCRIPTION]

5. Create src/preview-styles/config.ts (use instanceId, not storageKey,
   for new sites). Always set drawerTheme: 'auto' unless the user explicitly
   requests a fixed drawer. Do not choose a named theme based on site
   aesthetics — 'auto' derives the drawer's appearance from the active
   preset's swatches, which is the correct behavior for client presentations.
   Only use 'studio' | 'techie' | 'rustic' if you intentionally want the
   drawer locked to a single appearance regardless of which preset is selected.
   Mount PrepaintScript + StylePreview in the layout,
   add NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true to .env.local.
   Note: the edge trigger is draggable, keyboard-accessible, and
   respects prefers-reduced-motion automatically.

6. Token audit + typecheck + verify.

Use 5-6 parallel agents where possible.
```

### Filling in the directed prompt

| Bracket | Example |
|---|---|
| `[CURRENT THEME NAME]` | "Clean Professional", "Dark Industrial", "Original" |
| `[NAME]: [DESCRIPTION]` | "Midnight Steel: cool blue-gray dark theme with steel blue accent" |

You only need to fill in the preset names/descriptions. Claude finds everything else.

---

## What each prompt does NOT include (by design)

- **Theme class, tokens, layout path** — Claude reads the project to discover these. You don't need to look them up.
- **Specific hex values for presets** — Claude derives WCAG-compliant values from the existing tokens and the direction you describe (or invents directions if you use the minimal prompt). The package auto-selects foreground contrast on accent backgrounds, so any accent color works.
- **Source copying** — The picker engine lives in the installed `@westline/style-preview` package. Only `src/preview-styles/*` stays in the consuming repo.
- **Step-by-step file creation details** — GUIDE.md inside the installed package handles that. The prompt points Claude to it.

---

## For new projects

Don't use this prompt. The playbooks already include style preview:
- **Playbook A** (static sites): Phase 5.5
- **Playbook B** (apps/dashboards): Phase 6.5

These tell you when to add it in the build sequence and link to GUIDE.md.
