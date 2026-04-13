# Westline Style Preview -- Package Integration Guide

## Overview

`@westline/style-preview` is a shared package for separate site repos. The package owns the picker engine, persistence, prepaint behavior, and UI shell. Each site repo keeps its own `src/preview-styles/config.ts` and `src/preview-styles/presets/*.ts`.

The feature is staging-only by default. Both `PrepaintScript` and `StylePreview` render nothing unless `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true'`.

## Prerequisites

- React or Next.js site using TypeScript
- CSS custom properties defined on a theme wrapper class
- At least 3-5 theme tokens already consumed via `var(--token)`
- Private package install access via `NPM_TOKEN`

## 1. Install the Package

In the consuming site repo:

```bash
npm install @westline/style-preview
```

If the package comes from private npm, keep a local `.npmrc` like this:

```ini
@westline:registry=https://registry.npmjs.org
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
always-auth=true
```

Use the same token-based install flow in Vercel and Railway.

## 2. Create Local Presets

Create `src/preview-styles/presets/[surface].ts` inside the site repo.

```ts
import type { StylePreset } from '@westline/style-preview'

type StorefrontToken =
  | '--bg' | '--bg-alt' | '--surface' | '--border'
  | '--text' | '--text-muted' | '--accent' | '--accent-hover'

export const STOREFRONT_TOKENS: StorefrontToken[] = [
  '--bg', '--bg-alt', '--surface', '--border',
  '--text', '--text-muted', '--accent', '--accent-hover',
]

export const storefrontPresets: StylePreset[] = [
  {
    id: 'default',
    label: 'Current Design',
    description: 'Existing theme -- no overrides',
    variables: {},
    swatches: ['#111827', '#0F172A', '#F8FAFC', '#2563EB', '#334155'],
  },
  {
    id: 'cool-steel',
    label: 'Cool Steel',
    description: 'Blue-gray palette with brighter accent',
    variables: {
      '--bg': '#0C1220',
      '--bg-alt': '#141E30',
      '--surface': '#1C2940',
      '--border': '#2A3A55',
      '--text': '#DAE1ED',
      '--text-muted': '#7A8FAA',
      '--accent': '#3B8ECC',
      '--accent-hover': '#5AA3DD',
    },
    swatches: ['#0C1220', '#1C2940', '#DAE1ED', '#3B8ECC', '#2A3A55'],
  },
]
```

Guidelines:

- 4 presets is the sweet spot: default + 3 alternates
- The `default` preset should keep `variables: {}`
- Keep presets materially different
- Only override tokens the site actually uses

## 3. Create Local Config

Create `src/preview-styles/config.ts` in the site repo.

```ts
import type { PreviewConfig } from '@westline/style-preview'
import { validatePreset } from '@westline/style-preview'
import { storefrontPresets, STOREFRONT_TOKENS } from './presets/storefront'

export const previewConfig: PreviewConfig = {
  defaultStyleId: 'default',
  targetSelector: '.theme-storefront',
  presets: storefrontPresets,
  allowedTokens: STOREFRONT_TOKENS,
  instanceId: 'storefront-preview',
  drawerTheme: 'auto',  // almost always the right choice; recolors drawer to match active preset
}

if (process.env.NODE_ENV !== 'production') {
  for (const preset of previewConfig.presets) {
    if (!validatePreset(preset, STOREFRONT_TOKENS)) {
      console.warn(
        `[preview-styles] Preset "${preset.id}" fails validation against allowed tokens.`,
        preset
      )
    }
  }
}
```

Config rules:

- `targetSelector` must match the site wrapper class
- `presets`, `allowedTokens`, and `uiTheme` stay site-local
- `instanceId` is the primary namespace for storage and prepaint identity — pick a stable string per site
- `storageKey` is only needed when migrating from a pre-package setup (see "Migrating from pre-0.1 setups" below)

## 4. Mount in the Site Layout

Import the server-safe and client entrypoints separately.

```tsx
import { PrepaintScript } from '@westline/style-preview'
import { StylePreview } from '@westline/style-preview/client'
import { previewConfig } from '@/preview-styles/config'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrepaintScript config={previewConfig} />
      <div className="theme-storefront min-h-screen">
        {children}
      </div>
      <StylePreview config={previewConfig} />
    </>
  )
}
```

Placement matters:

- `PrepaintScript` goes before the themed wrapper
- `StylePreview` goes after the wrapper
- Mount the picker once per site layout

## 5. Environment Setup

Local development:

```bash
NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true npm run dev
```

This flag is a build-time concern for the consuming app. Changing it requires a rebuild or redeploy.

### Vercel

- Set `NPM_TOKEN` at the team or project level
- Set `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true` only in Preview or staging
- Leave it unset in Production
- Use `vercel env pull` locally when you want parity with deployed envs

### Railway

- Set `NPM_TOKEN` as a service variable
- Set `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true` only in staging
- Leave it unset in Production
- Be careful with skipped builds when a `NEXT_PUBLIC_*` value changes

## 6. Token Audit

Before handing the site to a client, confirm the app actually responds to token changes:

1. Replace hardcoded theme hex values with `var(--token)`
2. Convert token-driven `rgba(...)` colors to token-based `color-mix(...)` where needed
3. Check header, nav, hero, cards, footer, and other high-visibility UI
4. Leave status colors and black overlays hardcoded when they should not theme-shift

## 7. Verify

Run through this checklist on the staging deploy:

```text
[ ] Trigger visible on the intended routes
[ ] Trigger can be dragged up/down along the right edge; position persists across reloads
[ ] Presets change the whole themed surface
[ ] Active preset card shows an accent-colored left-edge bar
[ ] Selection persists across navigation
[ ] Hard refresh keeps the right preset without flash
[ ] ?previewStyle=preset-id loads the preset
[ ] Reset clears storage and URL state
[ ] Keyboard flow works: open, tab, escape, close
[ ] Mobile layout remains usable
[ ] Production/staging env gating works correctly
```

## Accessibility & UX Notes

- **Reduced motion:** When `prefers-reduced-motion` is active, all trigger transitions are disabled. Drag repositioning still works.
- **Hydration:** The component uses React 18's `useSyncExternalStore` for SSR/hydration, avoiding flash of missing content on first render.
- **Dynamic border-radius:** Drawer and card border radii scale proportionally from the theme's `borderRadius` token (drawer = base x 1.6, cards = base x 1.25, buttons = base x 1.0, all clamped to reasonable bounds).
- **Trigger position:** The edge tab is draggable along the right viewport edge (clamped to 10--90% of viewport height). Position is persisted in localStorage, keyed by `instanceId`.

## 8. Client Handoff

Once the client chooses a direction:

1. Copy the winning preset values into the permanent site theme tokens
2. Remove `PrepaintScript` and `StylePreview` from the site layout
3. Delete local `src/preview-styles/*` files if they are no longer needed
4. Remove `@westline/style-preview` from the site repo if the preview tool is no longer needed
5. Remove `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW` from the site envs

## Migrating from pre-0.1 setups

If your site used a custom preview implementation with `sessionStorage` before this package existed, you may have active user sessions storing their chosen preset under a legacy storage key. To migrate without losing those selections:

1. Set `instanceId` to your new stable identifier
2. Set `storageKey` to the OLD key that existing sessions still use
3. Deploy with both fields

```ts
export const previewConfig: PreviewConfig = {
  defaultStyleId: 'default',
  targetSelector: '.theme-storefront',
  presets: storefrontPresets,
  allowedTokens: STOREFRONT_TOKENS,
  instanceId: 'storefront-preview',      // new primary identifier
  storageKey: 'old-legacy-preview-key',  // old key from pre-package era
}
```

On first page load after the upgrade, the package will:

- Read the user's selection from the old key
- Write it back under the new `instanceId` key
- Delete the old key so it is not consulted again

This works in both the React runtime and the prepaint inline script, so the upgrade is flash-free. After you're confident most users have been served (usually 1-2 weeks), you can drop `storageKey` from the config in a follow-up deploy. Future sessions will use `instanceId` exclusively.

## Drawer Themes

The package ships with three built-in drawer themes plus an auto mode:

| Theme | Look | Follows presets? | Best for |
|---|---|---|---|
| `auto` | Derives drawer chrome from active preset swatches | **Yes** | **Default -- use this** |
| `studio` | Light, Westline green accent, soft radius | No (locked) | Fixed light drawer |
| `techie` | Dark, electric blue accent, sharp corners | No (locked) | Fixed dark drawer |
| `rustic` | Warm dark, copper accent, industrial fonts | No (locked) | Fixed warm drawer |

Always use `auto` unless you explicitly need a permanently fixed drawer appearance. The `auto` mode recolors the drawer chrome every time the user switches presets, which is the correct behavior for client presentations where the drawer should feel like part of the selected design direction. Named themes (`studio`, `techie`, `rustic`) lock the drawer to one static look regardless of which preset is active -- only use them when that is intentional.

Set `drawerTheme` in your config:

```ts
export const previewConfig: PreviewConfig = {
  // ...
  drawerTheme: 'auto',  // default when omitted; almost always the right choice
}
```

**Auto-derive caveat:** When the active preset is the configured default (i.e., `defaultStyleId`), auto mode falls back to the Studio base theme rather than deriving from swatches. Only non-default presets trigger swatch-driven drawer chrome.

### Custom UI Theme Override

If the built-in themes don't fit, override entirely with `uiTheme` (takes precedence over `drawerTheme` and auto derivation):

```ts
import type { PreviewConfig, PreviewUITheme } from '@westline/style-preview'

const sitePreviewTheme: PreviewUITheme = {
  bg: '#FFFFFF',
  bgAlt: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  accent: '#2563EB',
  fontBody: 'system-ui, sans-serif',
  fontHeading: 'system-ui, sans-serif',
  borderRadius: '10px',
  shadowElevation: '0 8px 24px rgba(0,0,0,0.08)',
  isDark: false,
}

export const previewConfig: PreviewConfig = {
  defaultStyleId: 'default',
  targetSelector: '.theme-storefront',
  presets: [],
  uiTheme: sitePreviewTheme,
}
```

### Dev-Mode Theme Preview

In development, append `?previewDrawer=techie` (or `studio` / `rustic`) to any page URL to preview a different drawer theme without editing config. This still previews the static built-in drawer themes and is stripped in production builds.

## How It Works

- `resolveDrawerTheme()` resolves the drawer chrome: explicit `uiTheme` > explicit built-in `drawerTheme` > auto-derived swatch theme > `'studio'` fallback
- URL param wins over browser storage, which wins over the default preset
- `PrepaintScript` injects a minimal style block before first paint
- `StylePreview` portals the drawer into `document.body`
- `allowedTokens` is enforced during validation, prepaint generation, and DOM application
- `instanceId ?? storageKey ?? DEFAULT` is used to namespace storage and prepaint identity

## Reference Pattern

The shared package stays in this repo. Every consuming site repo keeps only:

- `src/preview-styles/presets/*.ts`
- `src/preview-styles/config.ts`
- layout wiring for `PrepaintScript` and `StylePreview`
