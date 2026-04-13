import { describe, expect, it } from 'vitest'
import type { PreviewConfig, PreviewUITheme } from '../types/index.js'
import {
  DRAWER_THEMES,
  parsePreviewDrawerParam,
  resolveDrawerTheme,
} from './index.js'

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
