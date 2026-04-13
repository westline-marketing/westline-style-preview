import { describe, expect, it } from 'vitest'
import { parseHex } from '../themes/color-utils.js'

/**
 * Pure-logic mirrors of the computations inside PresetCard.tsx.
 *
 * PresetCard is being updated to match PreviewDrawer:
 *   - parseFloat (not parseInt) for borderRadius
 *   - fallback = 8
 *   - accentFg derived from weighted luminance
 *
 * These helpers let us unit-test the math without rendering React.
 */

/** Matches the updated radius parsing in PresetCard (parseFloat, fallback 8). */
function computeCardRadius(borderRadius: string | undefined): number {
  const baseRadius = parseFloat(borderRadius ?? '8') || 8
  return Math.min(14, Math.max(4, baseRadius * 1.25))
}

/** Matches the accent foreground logic ported from PreviewDrawer. */
function computeAccentFg(accentHex: string): string {
  const [r, g, b] = parseHex(accentHex)
  const accentIsLight = (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.5
  return accentIsLight ? '#1C1917' : '#FFFFFF'
}

// ---------------------------------------------------------------------------
// Card radius clamping
// Formula: Math.min(14, Math.max(4, parseFloat(borderRadius ?? '8') * 1.25))
// ---------------------------------------------------------------------------
describe('PresetCard — card radius clamping', () => {
  it('falls back to 8 when input is 0 (falsy, so || 8 fires)', () => {
    // parseFloat('0') = 0, which is falsy → || 8 → 8 * 1.25 = 10
    expect(computeCardRadius('0')).toBe(10)
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
// Accent contrast (accentFg)
// Weighted luminance: (0.299*R + 0.587*G + 0.114*B) / 255
//   >= 0.5 → dark foreground (#1C1917)
//   <  0.5 → white foreground (#FFFFFF)
// ---------------------------------------------------------------------------
describe('PresetCard — accent contrast (accentFg)', () => {
  it('returns dark fg for white accent', () => {
    expect(computeAccentFg('#FFFFFF')).toBe('#1C1917')
  })

  it('returns white fg for black accent', () => {
    expect(computeAccentFg('#000000')).toBe('#FFFFFF')
  })

  it('returns dark fg for a bright yellow accent (#FFD700)', () => {
    // R=255 G=215 B=0 → (0.299*255 + 0.587*215 + 0.114*0)/255 ≈ 0.793
    expect(computeAccentFg('#FFD700')).toBe('#1C1917')
  })

  it('returns white fg for a dark navy accent (#1A1D23)', () => {
    // R=26 G=29 B=35 → (0.299*26 + 0.587*29 + 0.114*35)/255 ≈ 0.114
    expect(computeAccentFg('#1A1D23')).toBe('#FFFFFF')
  })

  it('returns dark fg for a light pastel accent (#A8D8EA)', () => {
    // R=168 G=216 B=234 → (0.299*168 + 0.587*216 + 0.114*234)/255 ≈ 0.798
    expect(computeAccentFg('#A8D8EA')).toBe('#1C1917')
  })

  it('returns white fg for a saturated red (#CC2222)', () => {
    // R=204 G=34 B=34 → (0.299*204 + 0.587*34 + 0.114*34)/255 ≈ 0.335
    expect(computeAccentFg('#CC2222')).toBe('#FFFFFF')
  })

  it('returns dark fg for the default package accent (#E8930C — light enough)', () => {
    // R=232 G=147 B=12 → (0.299*232 + 0.587*147 + 0.114*12)/255
    // = (69.368 + 86.289 + 1.368)/255 = 157.025/255 ≈ 0.616 → light → dark fg
    expect(computeAccentFg('#E8930C')).toBe('#1C1917')
  })

  it('handles shorthand hex (#FFF)', () => {
    expect(computeAccentFg('#FFF')).toBe('#1C1917')
  })

  it('handles shorthand hex (#000)', () => {
    expect(computeAccentFg('#000')).toBe('#FFFFFF')
  })
})

// ---------------------------------------------------------------------------
// parseFloat behavior (vs parseInt)
// parseFloat preserves decimals; parseInt would truncate them.
// The fallback (|| 8) catches NaN from unparseable strings and 0.
// ---------------------------------------------------------------------------
describe('PresetCard — parseFloat radius parsing', () => {
  it('preserves decimal values that parseInt would truncate', () => {
    // parseFloat('10.5') = 10.5; parseInt('10.5') = 10
    // 10.5 * 1.25 = 13.125 (vs parseInt: 10 * 1.25 = 12.5)
    expect(computeCardRadius('10.5')).toBe(13.125)
  })

  it('handles a sub-pixel value like 6.4', () => {
    // parseFloat('6.4') = 6.4 → 6.4 * 1.25 = 8
    expect(computeCardRadius('6.4')).toBe(8)
  })

  it('falls back to 8 for NaN-producing strings', () => {
    // parseFloat('abc') = NaN → || 8 → 8 * 1.25 = 10
    expect(computeCardRadius('abc')).toBe(10)
  })

  it('falls back to 8 for empty string', () => {
    // parseFloat('') = NaN → || 8 → 8 * 1.25 = 10
    expect(computeCardRadius('')).toBe(10)
  })

  it('treats "0" as falsy and falls back to 8', () => {
    // parseFloat('0') = 0 → falsy → || 8 → 8 * 1.25 = 10
    expect(computeCardRadius('0')).toBe(10)
  })

  it('handles value with px suffix (parseFloat stops at non-numeric)', () => {
    // parseFloat('12px') = 12 → 12 * 1.25 = 15 → clamped to 14
    expect(computeCardRadius('12px')).toBe(14)
  })

  it('handles value with rem suffix', () => {
    // parseFloat('0.75rem') = 0.75 → 0.75 * 1.25 = 0.9375 → clamped to 4 (min)
    expect(computeCardRadius('0.75rem')).toBe(4)
  })
})
