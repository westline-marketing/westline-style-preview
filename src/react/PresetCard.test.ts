import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickAccentForeground, contrastRatio } from '../themes/color-utils.js'
import { parseRadius } from '../core/parse-radius.js'

/**
 * Tests for the computations used by PresetCard.tsx.
 *
 * PresetCard delegates to shared helpers:
 *   - pickAccentForeground() for accent contrast
 *   - parseRadius() for border-radius parsing
 *
 * These tests verify the helpers produce correct results for the
 * values PresetCard passes to them, plus edge cases.
 */

/** Mirrors the card-radius formula from PresetCard.tsx. */
function computeCardRadius(borderRadius: string | undefined): number {
  const baseRadius = parseRadius(borderRadius, 8)
  return Math.min(14, Math.max(4, baseRadius * 1.25))
}

// ---------------------------------------------------------------------------
// Source-code integration check: PresetCard.tsx must use the shared helpers
// ---------------------------------------------------------------------------
describe('PresetCard — source integration', () => {
  const src = readFileSync(
    resolve(__dirname, 'PresetCard.tsx'),
    'utf-8',
  )

  it('uses pickAccentForeground (not inline luminance)', () => {
    expect(src).toContain('pickAccentForeground')
    // Should NOT contain the old inline computation
    expect(src).not.toContain('accentIsLight')
    expect(src).not.toContain('0.299')
  })

  it('uses parseRadius (not inline parseFloat fallback)', () => {
    expect(src).toContain('parseRadius')
    // Should NOT contain the old parseFloat-based pattern
    expect(src).not.toMatch(/parseFloat\(theme\.borderRadius/)
  })
})

// ---------------------------------------------------------------------------
// Card radius clamping
// Formula: Math.min(14, Math.max(4, parseRadius(borderRadius, 8) * 1.25))
// ---------------------------------------------------------------------------
describe('PresetCard — card radius clamping', () => {
  it('preserves zero when input is "0" (parseRadius returns 0, not fallback)', () => {
    // parseRadius('0', 8) = 0 → 0 * 1.25 = 0 → clamped to 4
    expect(computeCardRadius('0')).toBe(4)
  })

  it('preserves zero with px suffix ("0px")', () => {
    // parseRadius('0px', 8) = 0 → 0 * 1.25 = 0 → clamped to 4
    expect(computeCardRadius('0px')).toBe(4)
  })

  it('clamps to minimum 4 for very small baseRadius', () => {
    // 1 * 1.25 = 1.25 → clamped to 4
    expect(computeCardRadius('1')).toBe(4)
  })

  it('clamps to minimum 4 for baseRadius 2', () => {
    // 2 * 1.25 = 2.5 → clamped to 4
    expect(computeCardRadius('2')).toBe(4)
  })

  it('computes 5 for baseRadius 4', () => {
    expect(computeCardRadius('4')).toBe(5)
  })

  it('computes 10 for the default fallback baseRadius 8', () => {
    expect(computeCardRadius('8')).toBe(10)
  })

  it('computes 10 when borderRadius is undefined (fallback = 8)', () => {
    expect(computeCardRadius(undefined)).toBe(10)
  })

  it('computes 12.5 for baseRadius 10', () => {
    expect(computeCardRadius('10')).toBe(12.5)
  })

  it('clamps to maximum 14 for baseRadius 12', () => {
    // 12 * 1.25 = 15, clamped to 14
    expect(computeCardRadius('12')).toBe(14)
  })

  it('clamps to maximum 14 for very large values', () => {
    expect(computeCardRadius('100')).toBe(14)
  })
})

// ---------------------------------------------------------------------------
// Accent contrast (accentFg) — using pickAccentForeground
// Picks #000000 or #FFFFFF based on maximum WCAG contrast ratio
// ---------------------------------------------------------------------------
describe('PresetCard — accent contrast (pickAccentForeground)', () => {
  it('returns #000000 for white accent', () => {
    expect(pickAccentForeground('#FFFFFF')).toBe('#000000')
  })

  it('returns #FFFFFF for black accent', () => {
    expect(pickAccentForeground('#000000')).toBe('#FFFFFF')
  })

  it('returns #000000 for a bright yellow accent (#FFD700)', () => {
    expect(pickAccentForeground('#FFD700')).toBe('#000000')
  })

  it('returns #FFFFFF for a dark navy accent (#1A1D23)', () => {
    expect(pickAccentForeground('#1A1D23')).toBe('#FFFFFF')
  })

  it('returns #000000 for a light pastel accent (#A8D8EA)', () => {
    expect(pickAccentForeground('#A8D8EA')).toBe('#000000')
  })

  it('returns #FFFFFF for a saturated red (#CC2222)', () => {
    expect(pickAccentForeground('#CC2222')).toBe('#FFFFFF')
  })

  it('handles shorthand hex (#FFF)', () => {
    expect(pickAccentForeground('#FFF')).toBe('#000000')
  })

  it('handles shorthand hex (#000)', () => {
    expect(pickAccentForeground('#000')).toBe('#FFFFFF')
  })

  // Shipped accent colors: verify exact foreground AND confirm max contrast
  const shippedAccents: Array<[string, string]> = [
    ['#5B8A72', '#000000'],
    ['#58A6FF', '#000000'],
    ['#D4874D', '#000000'],
    ['#CC8A10', '#000000'],
    ['#6AAA64', '#000000'],
  ]

  for (const [accent, expectedFg] of shippedAccents) {
    it(`picks ${expectedFg} for shipped accent ${accent}`, () => {
      expect(pickAccentForeground(accent)).toBe(expectedFg)
    })

    it(`chosen fg for ${accent} has higher contrast than the alternative`, () => {
      const altFg = expectedFg === '#000000' ? '#FFFFFF' : '#000000'
      const chosenContrast = contrastRatio(accent, expectedFg)
      const altContrast = contrastRatio(accent, altFg)
      expect(chosenContrast).toBeGreaterThanOrEqual(altContrast)
    })
  }
})

// ---------------------------------------------------------------------------
// Radius parsing via parseRadius
// Strict px/unitless parser — rejects rem/em/%, preserves zero
// ---------------------------------------------------------------------------
describe('PresetCard — parseRadius behavior', () => {
  it('preserves decimal values', () => {
    // parseRadius('10.5', 8) = 10.5 → 10.5 * 1.25 = 13.125
    expect(computeCardRadius('10.5')).toBe(13.125)
  })

  it('handles a sub-pixel value like 6.4', () => {
    // parseRadius('6.4', 8) = 6.4 → 6.4 * 1.25 = 8
    expect(computeCardRadius('6.4')).toBe(8)
  })

  it('falls back to 8 for NaN-producing strings', () => {
    // parseRadius('abc', 8) = 8 → 8 * 1.25 = 10
    expect(computeCardRadius('abc')).toBe(10)
  })

  it('falls back to 8 for empty string', () => {
    // parseRadius('', 8) = 8 → 8 * 1.25 = 10
    expect(computeCardRadius('')).toBe(10)
  })

  it('preserves zero (does NOT fall back to 8)', () => {
    // parseRadius('0', 8) = 0 → 0 * 1.25 = 0 → clamped to 4
    expect(parseRadius('0', 8)).toBe(0)
    expect(computeCardRadius('0')).toBe(4)
  })

  it('preserves zero with px suffix', () => {
    // parseRadius('0px', 8) = 0 → 0 * 1.25 = 0 → clamped to 4
    expect(parseRadius('0px', 8)).toBe(0)
    expect(computeCardRadius('0px')).toBe(4)
  })

  it('handles value with px suffix', () => {
    // parseRadius('12px', 8) = 12 → 12 * 1.25 = 15 → clamped to 14
    expect(computeCardRadius('12px')).toBe(14)
  })

  it('rejects rem values and falls back', () => {
    // parseRadius('0.75rem', 8) = 8 (fallback) → 8 * 1.25 = 10
    expect(parseRadius('0.75rem', 8)).toBe(8)
    expect(computeCardRadius('0.75rem')).toBe(10)
  })

  it('rejects 0.5rem and falls back', () => {
    // parseRadius('0.5rem', 8) = 8 (fallback) → 8 * 1.25 = 10
    expect(parseRadius('0.5rem', 8)).toBe(8)
    expect(computeCardRadius('0.5rem')).toBe(10)
  })
})
