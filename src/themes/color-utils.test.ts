import { describe, it, expect } from 'vitest'
import { wcagLuminance, contrastRatio, pickAccentForeground } from './color-utils.js'

// ---------------------------------------------------------------------------
// wcagLuminance
// ---------------------------------------------------------------------------

describe('wcagLuminance', () => {
  it('returns 0 for pure black', () => {
    expect(wcagLuminance('#000000')).toBe(0)
  })

  it('returns 1 for pure white', () => {
    expect(wcagLuminance('#FFFFFF')).toBe(1)
  })

  it('returns ~0.2159 for mid-grey (#808080)', () => {
    expect(wcagLuminance('#808080')).toBeCloseTo(0.2159, 3)
  })

  it('uses gamma linearization, NOT BT.601 luma', () => {
    // BT.601 would give ~0.502 for #808080 (128/255).
    // WCAG gamma linearization gives ~0.216 — a very different value.
    const wcag = wcagLuminance('#808080')
    const bt601Normalized = (0.299 * 128 + 0.587 * 128 + 0.114 * 128) / 255

    // They must not be close — the formulas are fundamentally different
    expect(Math.abs(wcag - bt601Normalized)).toBeGreaterThan(0.25)
  })
})

// ---------------------------------------------------------------------------
// contrastRatio
// ---------------------------------------------------------------------------

describe('contrastRatio', () => {
  it('returns 21 for black vs white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21)
  })

  it('returns 21 regardless of argument order', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBe(21)
  })

  it('returns 1 for same color vs itself', () => {
    expect(contrastRatio('#000000', '#000000')).toBe(1)
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1)
    expect(contrastRatio('#5B8A72', '#5B8A72')).toBe(1)
  })

  it('returns ~5.32 for #5B8A72 (studio accent) vs black', () => {
    expect(contrastRatio('#5B8A72', '#000000')).toBeCloseTo(5.32, 1)
  })

  it('returns ~3.95 for #5B8A72 (studio accent) vs white', () => {
    expect(contrastRatio('#5B8A72', '#FFFFFF')).toBeCloseTo(3.95, 1)
  })
})

// ---------------------------------------------------------------------------
// pickAccentForeground — shipped/example accents
// ---------------------------------------------------------------------------

describe('pickAccentForeground — shipped accents', () => {
  it('#5B8A72 (studio) -> black, with >= 4.5:1 contrast', () => {
    const fg = pickAccentForeground('#5B8A72')
    expect(fg).toBe('#000000')
    expect(contrastRatio('#5B8A72', fg)).toBeGreaterThanOrEqual(4.5)
  })

  it('#58A6FF (techie) -> black, with >= 4.5:1 contrast', () => {
    const fg = pickAccentForeground('#58A6FF')
    expect(fg).toBe('#000000')
    expect(contrastRatio('#58A6FF', fg)).toBeGreaterThanOrEqual(4.5)
  })

  it('#D4874D (rustic) -> black, with >= 4.5:1 contrast', () => {
    const fg = pickAccentForeground('#D4874D')
    expect(fg).toBe('#000000')
    expect(contrastRatio('#D4874D', fg)).toBeGreaterThanOrEqual(4.5)
  })

  it('#CC8A10 (example preset) -> black, with >= 4.5:1 contrast', () => {
    const fg = pickAccentForeground('#CC8A10')
    expect(fg).toBe('#000000')
    expect(contrastRatio('#CC8A10', fg)).toBeGreaterThanOrEqual(4.5)
  })

  it('#6AAA64 (example preset) -> black, with >= 4.5:1 contrast', () => {
    const fg = pickAccentForeground('#6AAA64')
    expect(fg).toBe('#000000')
    expect(contrastRatio('#6AAA64', fg)).toBeGreaterThanOrEqual(4.5)
  })
})

// ---------------------------------------------------------------------------
// pickAccentForeground — edge cases
// ---------------------------------------------------------------------------

describe('pickAccentForeground — edge cases', () => {
  it('pure black -> white', () => {
    expect(pickAccentForeground('#000000')).toBe('#FFFFFF')
  })

  it('pure white -> black', () => {
    expect(pickAccentForeground('#FFFFFF')).toBe('#000000')
  })

  it('mid-grey #808080 -> picks whichever has higher contrast', () => {
    const fg = pickAccentForeground('#808080')
    const other = fg === '#000000' ? '#FFFFFF' : '#000000'

    expect(contrastRatio('#808080', fg)).toBeGreaterThanOrEqual(
      contrastRatio('#808080', other)
    )
  })

  it('for every edge case, the chosen foreground beats or ties the alternative', () => {
    const edgeCases = ['#000000', '#FFFFFF', '#808080']

    for (const accent of edgeCases) {
      const fg = pickAccentForeground(accent)
      const other = fg === '#000000' ? '#FFFFFF' : '#000000'

      expect(contrastRatio(accent, fg)).toBeGreaterThanOrEqual(
        contrastRatio(accent, other)
      )
    }
  })
})
