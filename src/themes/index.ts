import type { DrawerThemeName, PreviewUITheme, PreviewConfig } from '../types/index.js'
import { DEFAULT_UI_THEME } from '../types/index.js'
import { parseHex } from './color-utils.js'

type BuiltInDrawerThemeName = Exclude<DrawerThemeName, 'auto'>

/**
 * Built-in drawer chrome themes.
 *
 * techie  — dark, electric blue accent, sharp corners, monospace headings
 * studio  — light, Westline green accent, soft radius, clean sans-serif
 * rustic  — warm dark, copper accent, sturdy industrial fonts
 */
export const DRAWER_THEMES: Record<BuiltInDrawerThemeName, PreviewUITheme> = {
  techie: {
    bg: '#0D1117',
    bgAlt: '#161B22',
    surface: '#21262D',
    border: '#30363D',
    text: '#E6EDF3',
    textMuted: '#8B949E',
    accent: '#58A6FF',
    fontBody: "'Inter', system-ui, sans-serif",
    fontHeading: "'JetBrains Mono', 'SF Mono', monospace",
    borderRadius: '4px',
    shadowElevation: '0 8px 32px rgba(0,0,0,0.7)',
    isDark: true,
  },
  studio: {
    bg: '#FAFAF9',
    bgAlt: '#F0EFED',
    surface: '#E8E7E5',
    border: '#D4D3D0',
    text: '#1C1917',
    textMuted: '#78716C',
    accent: '#5B8A72',
    fontBody: "'Inter', system-ui, sans-serif",
    fontHeading: "'Inter', system-ui, sans-serif",
    borderRadius: '10px',
    shadowElevation: '0 8px 24px rgba(0,0,0,0.08)',
    isDark: false,
  },
  rustic: {
    bg: '#1A1510',
    bgAlt: '#252017',
    surface: '#302A1F',
    border: '#4A3F2F',
    text: '#F5EFE6',
    textMuted: '#A89880',
    accent: '#D4874D',
    fontBody: "'IBM Plex Sans', system-ui, sans-serif",
    fontHeading: "'IBM Plex Sans Condensed', 'IBM Plex Sans', sans-serif",
    borderRadius: '6px',
    shadowElevation: '0 6px 20px rgba(0,0,0,0.5)',
    isDark: true,
  },
}

/** Parse a hex color and return whether it's dark (luminance < 0.5). */
export function isThemeDark(hexBg: string): boolean {
  const [r, g, b] = parseHex(hexBg)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

/**
 * Resolve the drawer theme from a PreviewConfig.
 *
 * Priority: explicit uiTheme > named drawerTheme > auto/omitted studio base.
 * Always returns isDark (computed from bg if not set).
 */
export function resolveDrawerTheme(
  config: PreviewConfig
): PreviewUITheme & { isDark: boolean } {
  if (config.uiTheme) {
    return {
      ...config.uiTheme,
      isDark: config.uiTheme.isDark ?? isThemeDark(config.uiTheme.bg),
    }
  }
  const themeName: BuiltInDrawerThemeName =
    config.drawerTheme && config.drawerTheme !== 'auto'
      ? config.drawerTheme
      : 'studio'
  const theme = DRAWER_THEMES[themeName]
  return { ...theme, isDark: theme.isDark ?? isThemeDark(theme.bg) }
}

/** Parse `?previewDrawer=` value (development preview only). */
export function parsePreviewDrawerParam(
  value: string | null
): DrawerThemeName | undefined {
  if (!value) return undefined
  const v = value.trim().toLowerCase()
  if (v === 'techie' || v === 'studio' || v === 'rustic') return v
  return undefined
}
