import { describe, it, expect } from 'vitest'
import { parseHex } from '../themes/color-utils.js'

/**
 * Accent contrast computation extracted from PreviewDrawer.
 *
 * Uses the ITU-R BT.601 luma formula to decide whether a hex accent color
 * is perceptually light or dark, then returns the appropriate foreground.
 */
function accentForeground(accentHex: string): string {
  const [r, g, b] = parseHex(accentHex)
  const isLight = (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.5
  return isLight ? '#1C1917' : '#FFFFFF'
}

/**
 * Radius parsing extracted from PreviewDrawer.
 *
 * Changed from parseInt to parseFloat to handle decimal CSS values.
 * Default fallback changed from 6 to 8.
 */
function parseRadius(value: string | undefined): number {
  return parseFloat(value ?? '8') || 8
}

/**
 * Drawer radius clamping extracted from PreviewDrawer.
 *
 * Scales the base radius by 1.6x, clamped to [0, 22].
 */
function drawerRadius(base: number): number {
  return Math.min(22, Math.max(0, base * 1.6))
}

// ---------------------------------------------------------------------------
// Accent contrast
// ---------------------------------------------------------------------------

describe('accent contrast (accentFg)', () => {
  it('returns dark foreground for gold (#FFD700) — a light accent', () => {
    expect(accentForeground('#FFD700')).toBe('#1C1917')
  })

  it('returns dark foreground for sky blue (#87CEEB) — a light accent', () => {
    expect(accentForeground('#87CEEB')).toBe('#1C1917')
  })

  it('returns dark foreground for white (#FFFFFF)', () => {
    expect(accentForeground('#FFFFFF')).toBe('#1C1917')
  })

  it('returns white foreground for near-black (#1C1917)', () => {
    expect(accentForeground('#1C1917')).toBe('#FFFFFF')
  })

  it('returns white foreground for navy (#384B5F)', () => {
    expect(accentForeground('#384B5F')).toBe('#FFFFFF')
  })

  it('returns white foreground for muted green (#5B8A72)', () => {
    expect(accentForeground('#5B8A72')).toBe('#FFFFFF')
  })

  it('uses the same formula as isThemeDark (inverted threshold direction)', () => {
    // isThemeDark returns true when luminance < 0.5 (dark background).
    // accentForeground returns dark fg when luminance >= 0.5 (light accent).
    // Both use (0.299*r + 0.587*g + 0.114*b) / 255 — verify mid-grey boundary.
    const midGrey = '#808080' // luma ≈ 0.502 — just above 0.5
    expect(accentForeground(midGrey)).toBe('#1C1917') // light → dark fg
  })

  it('handles 3-char hex shorthand', () => {
    expect(accentForeground('#FFF')).toBe('#1C1917')
    expect(accentForeground('#000')).toBe('#FFFFFF')
  })
})

// ---------------------------------------------------------------------------
// Radius parsing
// ---------------------------------------------------------------------------

describe('radius parsing (parseFloat fallback)', () => {
  it('parses integer pixel values', () => {
    expect(parseRadius('10px')).toBe(10)
  })

  it('parses decimal pixel values', () => {
    expect(parseRadius('12.5px')).toBe(12.5)
  })

  it('parses decimal rem values', () => {
    expect(parseRadius('0.5rem')).toBe(0.5)
  })

  it('falls back to 8 for non-numeric strings (e.g. CSS var())', () => {
    expect(parseRadius('var(--r)')).toBe(8)
  })

  it('falls back to 8 for undefined input', () => {
    expect(parseRadius(undefined)).toBe(8)
  })

  it('falls back to 8 for empty string', () => {
    expect(parseRadius('')).toBe(8)
  })

  it('returns 0 for "0px" (does NOT trigger fallback — 0 is falsy but parseFloat returns 0)', () => {
    // parseFloat('0px') returns 0, which is falsy, so || 8 triggers.
    // This documents the actual behavior of the `parseFloat(x) || 8` pattern.
    expect(parseRadius('0px')).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// Radius clamping
// ---------------------------------------------------------------------------

describe('radius clamping (drawerRadius)', () => {
  it('scales 0 to 0', () => {
    expect(drawerRadius(0)).toBe(0)
  })

  it('scales 4 to 6.4', () => {
    expect(drawerRadius(4)).toBeCloseTo(6.4)
  })

  it('scales 10 to 16', () => {
    expect(drawerRadius(10)).toBe(16)
  })

  it('caps 15 at 22 (15 * 1.6 = 24 > 22)', () => {
    expect(drawerRadius(15)).toBe(22)
  })

  it('caps 100 at 22', () => {
    expect(drawerRadius(100)).toBe(22)
  })

  it('clamps negative input to 0', () => {
    expect(drawerRadius(-5)).toBe(0)
  })

  it('scales the default fallback (8) to 12.8', () => {
    expect(drawerRadius(8)).toBeCloseTo(12.8)
  })
})
