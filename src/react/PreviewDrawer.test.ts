import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickAccentForeground, contrastRatio } from '../themes/color-utils.js'
import { parseRadius } from '../core/parse-radius.js'

/**
 * Drawer radius clamping extracted from PreviewDrawer.
 *
 * Scales the base radius by 1.6x, clamped to [0, 22].
 */
function drawerRadius(base: number): number {
  return Math.min(22, Math.max(0, base * 1.6))
}

// ---------------------------------------------------------------------------
// Accent contrast — shipped theme accents
// ---------------------------------------------------------------------------

describe('accent contrast — shipped accents', () => {
  const shippedAccents: Array<{ hex: string; expectedFg: string }> = [
    { hex: '#5B8A72', expectedFg: '#000000' },
    { hex: '#58A6FF', expectedFg: '#000000' },
    { hex: '#D4874D', expectedFg: '#000000' },
    { hex: '#CC8A10', expectedFg: '#000000' },
    { hex: '#6AAA64', expectedFg: '#000000' },
  ]

  for (const { hex, expectedFg } of shippedAccents) {
    it(`returns ${expectedFg} for shipped accent ${hex}`, () => {
      expect(pickAccentForeground(hex)).toBe(expectedFg)
    })

    it(`${hex} foreground achieves max contrast of black/white`, () => {
      const fg = pickAccentForeground(hex)
      const chosenContrast = contrastRatio(hex, fg)
      const altFg = fg === '#FFFFFF' ? '#000000' : '#FFFFFF'
      const altContrast = contrastRatio(hex, altFg)
      expect(chosenContrast).toBeGreaterThanOrEqual(altContrast)
    })
  }
})

// ---------------------------------------------------------------------------
// Accent contrast — edge cases
// ---------------------------------------------------------------------------

describe('accent contrast — edge cases', () => {
  it('returns #FFFFFF for black (#000000)', () => {
    const fg = pickAccentForeground('#000000')
    expect(fg).toBe('#FFFFFF')
    // White has higher contrast against black than black does
    expect(contrastRatio('#000000', '#FFFFFF')).toBeGreaterThan(
      contrastRatio('#000000', '#000000')
    )
  })

  it('returns #000000 for white (#FFFFFF)', () => {
    const fg = pickAccentForeground('#FFFFFF')
    expect(fg).toBe('#000000')
    // Black has higher contrast against white than white does
    expect(contrastRatio('#FFFFFF', '#000000')).toBeGreaterThan(
      contrastRatio('#FFFFFF', '#FFFFFF')
    )
  })

  it('picks the higher-contrast foreground for mid-grey (#808080)', () => {
    const fg = pickAccentForeground('#808080')
    const altFg = fg === '#FFFFFF' ? '#000000' : '#FFFFFF'
    expect(contrastRatio('#808080', fg)).toBeGreaterThanOrEqual(
      contrastRatio('#808080', altFg)
    )
  })

  it('handles 3-char hex shorthand', () => {
    expect(pickAccentForeground('#FFF')).toBe('#000000')
    expect(pickAccentForeground('#000')).toBe('#FFFFFF')
  })
})

// ---------------------------------------------------------------------------
// Radius parsing — using the shared parseRadius helper
// ---------------------------------------------------------------------------

describe('radius parsing (parseRadius)', () => {
  it('parses integer pixel values', () => {
    expect(parseRadius('10px', 8)).toBe(10)
  })

  it('parses decimal pixel values', () => {
    expect(parseRadius('12.5px', 8)).toBe(12.5)
  })

  it('parses unitless integer', () => {
    expect(parseRadius('10', 8)).toBe(10)
  })

  it('returns 0 for "0" — preserves zero, does NOT fall back', () => {
    expect(parseRadius('0', 8)).toBe(0)
  })

  it('returns 0 for "0px" — preserves zero, does NOT fall back', () => {
    expect(parseRadius('0px', 8)).toBe(0)
  })

  it('returns fallback for rem values ("0.5rem")', () => {
    expect(parseRadius('0.5rem', 8)).toBe(8)
  })

  it('falls back for non-numeric strings (e.g. CSS var())', () => {
    expect(parseRadius('var(--r)', 8)).toBe(8)
  })

  it('falls back for undefined input', () => {
    expect(parseRadius(undefined, 8)).toBe(8)
  })

  it('falls back for empty string', () => {
    expect(parseRadius('', 8)).toBe(8)
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

// ---------------------------------------------------------------------------
// Component integration — verify PreviewDrawer.tsx uses the shared helpers
// ---------------------------------------------------------------------------

describe('PreviewDrawer source uses shared helpers', () => {
  const source = readFileSync(
    resolve(__dirname, 'PreviewDrawer.tsx'),
    'utf-8'
  )

  it('imports pickAccentForeground from color-utils', () => {
    expect(source).toContain(
      "import { pickAccentForeground } from '../themes/color-utils.js'"
    )
  })

  it('calls pickAccentForeground in the component body', () => {
    expect(source).toMatch(/pickAccentForeground\(theme\.accent\)/)
  })

  it('imports parseRadius from core/parse-radius', () => {
    expect(source).toContain(
      "import { parseRadius } from '../core/parse-radius.js'"
    )
  })

  it('calls parseRadius in the component body', () => {
    expect(source).toMatch(/parseRadius\(theme\.borderRadius,\s*8\)/)
  })

  it('does NOT contain the old inline luminance computation', () => {
    expect(source).not.toContain('0.299 * ar')
    expect(source).not.toContain('accentIsLight')
    expect(source).not.toContain("parseFloat(theme.borderRadius ?? '8') || 8")
  })
})
