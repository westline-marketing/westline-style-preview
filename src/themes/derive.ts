import type { PreviewUITheme } from '../types/index.js'
import { isThemeDark } from './index.js'
import { lerpHex } from './color-utils.js'

/**
 * Derive a full drawer theme from a preset's swatches array.
 *
 * Swatches convention: [bg, surface, text, accent, border].
 * Returns null when swatches are missing or insufficient, signaling
 * the caller should fall back to the base drawer theme.
 */
export function deriveDrawerTheme(
  swatches: string[] | undefined,
  base: PreviewUITheme & { isDark: boolean }
): (PreviewUITheme & { isDark: boolean }) | null {
  if (!swatches || swatches.length < 5) return null

  const [bg, surface, text, accent, border] = swatches
  const isDark = isThemeDark(bg)

  return {
    bg,
    bgAlt: lerpHex(bg, surface, 0.5),
    surface,
    border,
    text,
    textMuted: lerpHex(text, bg, 0.45),
    accent,
    fontBody: base.fontBody,
    fontHeading: base.fontHeading,
    borderRadius: base.borderRadius,
    shadowElevation: isDark
      ? '0 8px 32px rgba(0,0,0,0.6)'
      : '0 8px 24px rgba(0,0,0,0.08)',
    isDark,
  }
}
