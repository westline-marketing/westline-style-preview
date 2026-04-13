/**
 * Consumer-side example preset/config file.
 *
 * This file is a reference template for consuming site repos. It is NOT
 * built as part of this package (see tsconfig.build.json) and is NOT shipped
 * in the published tarball. The `@westline/style-preview` import below will
 * not resolve when viewed from inside this repo — it is written the way a
 * real consumer will write it, so you can copy this file into a site repo
 * at `src/preview-styles/config.ts` and adapt the preset content.
 *
 * Once copied into a consumer site that has installed `@westline/style-preview`,
 * the import resolves normally.
 */
import type { StylePreset, PreviewConfig } from '@westline/style-preview'

// 1. Define which CSS custom properties your presets are allowed to override.
//    These must match the variables in your theme wrapper class.
type StorefrontToken =
  | '--bg' | '--bg-alt' | '--surface' | '--border'
  | '--text' | '--text-muted' | '--accent' | '--accent-hover'

export const STOREFRONT_TOKENS: StorefrontToken[] = [
  '--bg', '--bg-alt', '--surface', '--border',
  '--text', '--text-muted', '--accent', '--accent-hover',
]

// 2. Define 4 presets. The default preset MUST have empty variables.
export const storefrontPresets: StylePreset[] = [
  {
    id: 'default',
    label: 'Current Design',
    description: 'Existing theme — no overrides applied',
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
  {
    id: 'warm-earth',
    label: 'Warm Earth',
    description: 'Earthy browns with amber accent',
    variables: {
      '--bg': '#1A1510',
      '--bg-alt': '#241E16',
      '--surface': '#2E261D',
      '--border': '#3D3428',
      '--text': '#F0E8DC',
      '--text-muted': '#A69882',
      '--accent': '#CC8A10',
      '--accent-hover': '#E09E28',
    },
    swatches: ['#1A1510', '#2E261D', '#F0E8DC', '#CC8A10', '#3D3428'],
  },
  {
    id: 'forest-moss',
    label: 'Forest Moss',
    description: 'Deep greens with sage accent',
    variables: {
      '--bg': '#0F1612',
      '--bg-alt': '#162019',
      '--surface': '#1E2B23',
      '--border': '#2B3C30',
      '--text': '#E6ECE4',
      '--text-muted': '#8FA093',
      '--accent': '#6AAA64',
      '--accent-hover': '#85C27F',
    },
    swatches: ['#0F1612', '#1E2B23', '#E6ECE4', '#6AAA64', '#2B3C30'],
  },
]

// 3. Wire into a config object.
export const exampleConfig: PreviewConfig = {
  defaultStyleId: 'default',
  targetSelector: '.theme-storefront', // must match your CSS wrapper class
  presets: storefrontPresets,
  allowedTokens: STOREFRONT_TOKENS,
  instanceId: 'storefront-preview', // stable identifier per site
  drawerTheme: 'studio', // 'studio' (default) | 'techie' | 'rustic'
}
