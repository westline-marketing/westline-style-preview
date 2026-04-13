import type { PreviewUITheme } from '../types/index.js'
import { isThemeDark } from './index.js'
import { lerpHex, contrastRatio } from './color-utils.js'

/**
 * Derive a full drawer theme from a preset's swatches array.
 *
 * Swatches convention: [bg, surface, text, accent, border].
 * Returns null when swatches are missing or insufficient, signaling
 * the caller should fall back to the base drawer theme.
 *
 * Contrast guard: if the swatch `text` color doesn't have sufficient
 * contrast against the swatch `bg` (common when site text is designed
 * for a different surface), the function swaps to the `surface` color
 * or a safe fallback so drawer content remains readable.
 */
export function deriveDrawerTheme(
  swatches: string[] | undefined,
  base: PreviewUITheme & { isDark: boolean }
): (PreviewUITheme & { isDark: boolean }) | null {
  if (!swatches || swatches.length < 5) return null

  const [bg, surface, text, accent, border] = swatches
  const isDark = isThemeDark(bg)

  // The swatch text color may not contrast with the swatch bg — e.g. a site
  // with dark bg and dark text (designed for reading on light content surfaces).
  // When contrast is insufficient, fall back to surface (typically the opposite
  // lightness) or a safe default.
  const MIN_CONTRAST = 4.5
  let drawerText = text
  if (contrastRatio(bg, text) < MIN_CONTRAST) {
    drawerText = contrastRatio(bg, surface) >= MIN_CONTRAST
      ? surface
      : isDark ? '#E6EDF3' : '#1C1917'
  }

  return {
    bg,
    bgAlt: lerpHex(bg, surface, 0.5),
    surface,
    border,
    text: drawerText,
    textMuted: lerpHex(drawerText, bg, 0.45),
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
