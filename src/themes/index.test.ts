import { describe, expect, it } from 'vitest'
import type { PreviewConfig, PreviewUITheme, StylePreset } from '../types/index.js'
import {
  DRAWER_THEMES,
  parsePreviewDrawerParam,
  resolveDrawerTheme,
} from './index.js'
import { deriveDrawerTheme } from './derive.js'

function makeConfig(overrides: Partial<PreviewConfig> = {}): PreviewConfig {
  return {
    defaultStyleId: 'default',
    targetSelector: '.theme-storefront',
    presets: [],
    ...overrides,
  }
}

describe('resolveDrawerTheme', () => {
  it('uses the studio base theme when drawerTheme is omitted', () => {
    const theme = resolveDrawerTheme(makeConfig())

    expect(theme).toMatchObject(DRAWER_THEMES.studio)
    expect(theme.isDark).toBe(false)
  })

  it('uses the studio base theme when drawerTheme is auto', () => {
    const theme = resolveDrawerTheme(makeConfig({ drawerTheme: 'auto' }))

    expect(theme).toMatchObject(DRAWER_THEMES.studio)
    expect(theme.isDark).toBe(false)
  })

  it('returns the named static drawer theme when requested', () => {
    expect(resolveDrawerTheme(makeConfig({ drawerTheme: 'techie' }))).toMatchObject(
      DRAWER_THEMES.techie
    )
    expect(resolveDrawerTheme(makeConfig({ drawerTheme: 'studio' }))).toMatchObject(
      DRAWER_THEMES.studio
    )
    expect(resolveDrawerTheme(makeConfig({ drawerTheme: 'rustic' }))).toMatchObject(
      DRAWER_THEMES.rustic
    )
  })

  it('lets uiTheme override both auto and named drawer themes', () => {
    const uiTheme: PreviewUITheme = {
      bg: '#101820',
      bgAlt: '#15202b',
      surface: '#1f2a35',
      border: '#31404d',
      text: '#f7f7f7',
      textMuted: '#aab4be',
      accent: '#f5a524',
      fontBody: "'Inter', sans-serif",
      fontHeading: "'Inter', sans-serif",
    }

    const autoTheme = resolveDrawerTheme(makeConfig({ drawerTheme: 'auto', uiTheme }))
    const staticTheme = resolveDrawerTheme(makeConfig({ drawerTheme: 'rustic', uiTheme }))

    expect(autoTheme).toMatchObject(uiTheme)
    expect(staticTheme).toMatchObject(uiTheme)
    expect(autoTheme.isDark).toBe(true)
    expect(staticTheme.isDark).toBe(true)
  })
})

describe('parsePreviewDrawerParam', () => {
  it('accepts the static built-in drawer themes', () => {
    expect(parsePreviewDrawerParam('techie')).toBe('techie')
    expect(parsePreviewDrawerParam(' studio ')).toBe('studio')
    expect(parsePreviewDrawerParam('RUSTIC')).toBe('rustic')
  })

  it('does not accept auto from the preview URL', () => {
    expect(parsePreviewDrawerParam('auto')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Auto-derive behavior for default preset
//
// Mirrors the derivation decision in StylePreview.tsx (lines 57-64):
//   1. If theme is locked (uiTheme or non-auto drawerTheme) -> base theme, no derivation
//   2. If activePresetId === config.defaultStyleId -> base theme, no derivation
//   3. If non-default preset with >= 5 swatches -> derived theme
//   4. If non-default preset with < 5 swatches (or none) -> fallback to base
// ---------------------------------------------------------------------------

/**
 * Pure re-implementation of the derivation decision from StylePreview.tsx
 * so we can test it without React/jsdom.
 */
function resolveActiveTheme(
  config: PreviewConfig,
  activePresetId: string
): { theme: PreviewUITheme & { isDark: boolean }; derived: boolean } {
  const baseTheme = resolveDrawerTheme(config)
  const isThemeLocked = Boolean(
    config.uiTheme || (config.drawerTheme && config.drawerTheme !== 'auto')
  )

  if (isThemeLocked) return { theme: baseTheme, derived: false }

  const activePreset = config.presets.find((p) => p.id === activePresetId)
  if (!activePreset || activePresetId === config.defaultStyleId) {
    return { theme: baseTheme, derived: false }
  }

  const derived = deriveDrawerTheme(activePreset.swatches, baseTheme)
  if (derived) return { theme: derived, derived: true }
  return { theme: baseTheme, derived: false }
}

const WARM_SWATCHES = ['#1A1510', '#252017', '#F5EFE6', '#D4874D', '#4A3F2F']
const LIGHT_SWATCHES = ['#FAFAF9', '#E8E7E5', '#1C1917', '#5B8A72', '#D4D3D0']

function makePresets(extras: Partial<StylePreset>[] = []): StylePreset[] {
  return [
    { id: 'default', label: 'Default', variables: {} },
    ...extras.map((e) => ({
      id: e.id ?? 'alt',
      label: e.label ?? 'Alternate',
      variables: e.variables ?? { '--accent': '#D4874D' },
      ...(e.swatches !== undefined ? { swatches: e.swatches } : {}),
    })),
  ]
}

describe('auto-derive: default preset uses base theme', () => {
  it('returns base theme (studio) when activePresetId equals defaultStyleId', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'default')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })

  it('returns base theme when activePresetId equals defaultStyleId even with drawerTheme auto', () => {
    const config = makeConfig({
      drawerTheme: 'auto',
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'default')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })

  it('does not derive even when default preset has swatches', () => {
    const config = makeConfig({
      presets: [
        { id: 'default', label: 'Default', variables: {}, swatches: LIGHT_SWATCHES },
        { id: 'warm', label: 'Warm', variables: { '--accent': '#D4874D' }, swatches: WARM_SWATCHES },
      ],
    })
    const { theme, derived } = resolveActiveTheme(config, 'default')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })
})

describe('auto-derive: non-default preset derives from swatches', () => {
  it('derives a different theme when non-default preset has 5 swatches', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const base = resolveDrawerTheme(config)
    const { theme, derived } = resolveActiveTheme(config, 'warm')

    expect(derived).toBe(true)
    // Derived theme bg comes from the preset swatches, not the base
    expect(theme.bg).toBe(WARM_SWATCHES[0])
    expect(theme.surface).toBe(WARM_SWATCHES[1])
    expect(theme.text).toBe(WARM_SWATCHES[2])
    expect(theme.accent).toBe(WARM_SWATCHES[3])
    expect(theme.border).toBe(WARM_SWATCHES[4])
    // Ensure it actually differs from studio base
    expect(theme.bg).not.toBe(base.bg)
    expect(theme.accent).not.toBe(base.accent)
  })

  it('derives from light swatches with correct isDark flag', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'light', swatches: LIGHT_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'light')

    expect(derived).toBe(true)
    expect(theme.isDark).toBe(false)
    expect(theme.bg).toBe(LIGHT_SWATCHES[0])
  })

  it('derives from dark swatches with correct isDark flag', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'warm')

    expect(derived).toBe(true)
    expect(theme.isDark).toBe(true)
  })

  it('preserves base theme fonts and borderRadius in derived theme', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const base = resolveDrawerTheme(config)
    const { theme } = resolveActiveTheme(config, 'warm')

    expect(theme.fontBody).toBe(base.fontBody)
    expect(theme.fontHeading).toBe(base.fontHeading)
    expect(theme.borderRadius).toBe(base.borderRadius)
  })
})

describe('auto-derive: insufficient swatches fall back to base', () => {
  it('falls back to base when non-default preset has no swatches', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'minimal', swatches: undefined }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'minimal')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })

  it('falls back to base when non-default preset has empty swatches', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'empty', swatches: [] }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'empty')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })

  it('falls back to base when non-default preset has fewer than 5 swatches', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'partial', swatches: ['#000', '#111', '#222'] }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'partial')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })

  it('falls back to base when non-default preset has exactly 4 swatches', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'four', swatches: ['#000', '#111', '#EEE', '#F00'] }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'four')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })
})

describe('auto-derive: locked theme bypasses derivation', () => {
  it('uses static named theme even for non-default preset with swatches', () => {
    const config = makeConfig({
      drawerTheme: 'techie',
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'warm')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.techie)
  })

  it('uses uiTheme override even for non-default preset with swatches', () => {
    const customUi: PreviewUITheme = {
      bg: '#101820',
      bgAlt: '#15202b',
      surface: '#1f2a35',
      border: '#31404d',
      text: '#f7f7f7',
      textMuted: '#aab4be',
      accent: '#f5a524',
      fontBody: "'Inter', sans-serif",
      fontHeading: "'Inter', sans-serif",
    }
    const config = makeConfig({
      uiTheme: customUi,
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'warm')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(customUi)
  })
})

describe('auto-derive: preset not found falls back to base', () => {
  it('returns base when activePresetId matches no preset', () => {
    const config = makeConfig({
      presets: makePresets([{ id: 'warm', swatches: WARM_SWATCHES }]),
    })
    const { theme, derived } = resolveActiveTheme(config, 'nonexistent')

    expect(derived).toBe(false)
    expect(theme).toMatchObject(DRAWER_THEMES.studio)
  })
})
