import { describe, it, expect } from 'vitest'
import { parseHex, lerpHex, contrastRatio } from './color-utils.js'
import { deriveDrawerTheme } from './derive.js'
import type { PreviewUITheme } from '../types/index.js'

const BASE_THEME: PreviewUITheme & { isDark: boolean } = {
  bg: '#0D1117',
  bgAlt: '#161B22',
  surface: '#21262D',
  border: '#30363D',
  text: '#E6EDF3',
  textMuted: '#8B949E',
  accent: '#58A6FF',
  fontBody: "'Inter', system-ui, sans-serif",
  fontHeading: "'JetBrains Mono', monospace",
  borderRadius: '4px',
  shadowElevation: '0 8px 32px rgba(0,0,0,0.7)',
  isDark: true,
}

describe('parseHex', () => {
  it('parses 6-char hex', () => {
    expect(parseHex('#AABBCC')).toEqual([170, 187, 204])
  })

  it('parses 3-char hex shorthand', () => {
    expect(parseHex('#FFF')).toEqual([255, 255, 255])
  })

  it('handles lowercase', () => {
    expect(parseHex('#aabbcc')).toEqual([170, 187, 204])
  })

  it('returns [0,0,0] for invalid hex', () => {
    expect(parseHex('not-a-color')).toEqual([0, 0, 0])
  })
})

describe('lerpHex', () => {
  it('returns midpoint at t=0.5', () => {
    expect(lerpHex('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  it('returns first color at t=0', () => {
    expect(lerpHex('#000000', '#ffffff', 0)).toBe('#000000')
  })

  it('returns second color at t=1', () => {
    expect(lerpHex('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  it('interpolates non-trivial colors', () => {
    // #000000 → #664422 at t=1 should be #664422
    expect(lerpHex('#000000', '#664422', 1)).toBe('#664422')
  })
})

describe('deriveDrawerTheme', () => {
  it('returns null for undefined swatches', () => {
    expect(deriveDrawerTheme(undefined, BASE_THEME)).toBeNull()
  })

  it('returns null for empty swatches', () => {
    expect(deriveDrawerTheme([], BASE_THEME)).toBeNull()
  })

  it('returns null for fewer than 5 swatches', () => {
    expect(deriveDrawerTheme(['#000', '#111', '#222'], BASE_THEME)).toBeNull()
  })

  it('derives a full theme from 5 swatches', () => {
    const swatches = ['#0F1114', '#23272F', '#F0F0F0', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)

    expect(result).not.toBeNull()
    expect(result!.bg).toBe('#0F1114')
    expect(result!.text).toBe('#F0F0F0')
    expect(result!.accent).toBe('#E8930C')
    // bgAlt, surface, border are derived from bg shifted toward text
    // (not raw swatch values) to keep the drawer palette coherent
    expect(result!.bgAlt).not.toBe(result!.bg) // shifted, not identical
  })

  it('computes bgAlt as a subtle shift from bg toward the surface hint', () => {
    const swatches = ['#000000', '#ffffff', '#F0F0F0', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    // 6% lerp from #000000 toward #F0F0F0 — should be a very dark gray, not #808080
    expect(result!.bgAlt).not.toBe('#808080')
    // bgAlt should stay close to bg (dark), not jump to medium gray
    expect(result!.bgAlt).toBe(lerpHex('#000000', '#ffffff', 0.06))
  })

  it('uses the border swatch as the source hint for the border tier', () => {
    const swatches = ['#000000', '#ffffff', '#F0F0F0', '#E8930C', '#336699']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.border).toBe(lerpHex('#000000', '#336699', 0.18))
  })

  it('computes textMuted as text blended toward bg', () => {
    const swatches = ['#000000', '#ffffff', '#ffffff', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    // lerp(#ffffff, #000000, 0.45) = 255 - (255 * 0.45) = 140 → #8c8c8c
    expect(result!.textMuted).toBe('#8c8c8c')
  })

  it('detects dark background', () => {
    const swatches = ['#0F1114', '#23272F', '#F0F0F0', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.isDark).toBe(true)
  })

  it('detects light background', () => {
    const swatches = ['#FAFAF9', '#E8E7E5', '#1C1917', '#5B8A72', '#D4D3D0']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.isDark).toBe(false)
  })

  it('inherits fonts and borderRadius from base theme', () => {
    const swatches = ['#0F1114', '#23272F', '#F0F0F0', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.fontBody).toBe(BASE_THEME.fontBody)
    expect(result!.fontHeading).toBe(BASE_THEME.fontHeading)
    expect(result!.borderRadius).toBe(BASE_THEME.borderRadius)
  })

  it('uses heavy shadow for dark themes', () => {
    const swatches = ['#0F1114', '#23272F', '#F0F0F0', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.shadowElevation).toBe('0 8px 32px rgba(0,0,0,0.6)')
  })

  it('uses light shadow for light themes', () => {
    const swatches = ['#FAFAF9', '#E8E7E5', '#1C1917', '#5B8A72', '#D4D3D0']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.shadowElevation).toBe('0 8px 24px rgba(0,0,0,0.08)')
  })

  it('ignores extra swatches beyond 5', () => {
    const swatches = ['#0F1114', '#23272F', '#F0F0F0', '#E8930C', '#2E3440', '#FF0000', '#00FF00']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result).not.toBeNull()
    expect(result!.bg).toBe('#0F1114')
  })

  describe('contrast guard', () => {
    it('swaps text to surface when text has poor contrast against bg (YTHB pattern)', () => {
      // YTHB "Bold & Clean": dark bg, light surface, dark text (designed for light surface)
      const swatches = ['#222222', '#F7F5F2', '#222222', '#C2582A', '#D5D0CA']
      const result = deriveDrawerTheme(swatches, BASE_THEME)

      // text (#222222) on bg (#222222) = ~1:1 contrast — should swap to surface (#F7F5F2)
      expect(result!.text).toBe('#F7F5F2')
      expect(result!.bg).toBe('#222222')
    })

    it('keeps text when it already contrasts with bg', () => {
      // Bill's Truck style: dark bg, dark surface, light text
      const swatches = ['#0F1114', '#23272F', '#F0F0F0', '#E8930C', '#2E3440']
      const result = deriveDrawerTheme(swatches, BASE_THEME)

      // text (#F0F0F0) on bg (#0F1114) = high contrast — keep as-is
      expect(result!.text).toBe('#F0F0F0')
    })

    it('derives readable textMuted from the corrected text color', () => {
      // When text is swapped to surface, textMuted should be derived from that
      const swatches = ['#1B2838', '#F5F7FA', '#1B2838', '#2BA8A0', '#D1D9E0']
      const result = deriveDrawerTheme(swatches, BASE_THEME)

      expect(result!.text).toBe('#F5F7FA')
      expect(contrastRatio(result!.textMuted, result!.bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(result!.textMuted, result!.bgAlt)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(result!.textMuted, result!.surface)).toBeGreaterThanOrEqual(4.5)
    })

    it('keeps textMuted readable on light auto-derived themes too', () => {
      const swatches = ['#FAFAF9', '#E8E7E5', '#1C1917', '#5B8A72', '#D4D3D0']
      const result = deriveDrawerTheme(swatches, BASE_THEME)

      expect(result!.isDark).toBe(false)
      expect(contrastRatio(result!.textMuted, result!.bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(result!.textMuted, result!.bgAlt)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(result!.textMuted, result!.surface)).toBeGreaterThanOrEqual(4.5)
    })

    it('falls back to safe default when neither text nor surface contrast with bg', () => {
      // Pathological: all dark colors
      const swatches = ['#111111', '#222222', '#111111', '#E8930C', '#333333']
      const result = deriveDrawerTheme(swatches, BASE_THEME)

      // Both text and surface are dark, bg is dark → should use safe light fallback
      expect(result!.text).toBe('#E6EDF3')
      expect(result!.isDark).toBe(true)
    })

    it('falls back to safe dark default on light bg when needed', () => {
      // Pathological: all light colors
      const swatches = ['#FAFAFA', '#F0F0F0', '#FAFAFA', '#5B8A72', '#E0E0E0']
      const result = deriveDrawerTheme(swatches, BASE_THEME)

      // Both text and surface are light, bg is light → should use safe dark fallback
      expect(result!.text).toBe('#1C1917')
      expect(result!.isDark).toBe(false)
    })

    it('handles all YTHB preset swatch patterns correctly', () => {
      const ythbPresets = [
        ['#1B2838', '#F5F7FA', '#1B2838', '#2BA8A0', '#D1D9E0'],
        ['#222222', '#F7F5F2', '#222222', '#C2582A', '#D5D0CA'],
        ['#1B4332', '#F5F1EB', '#1B4332', '#B87333', '#D5CFC7'],
        ['#1E293B', '#F8F6F1', '#1E293B', '#D4A843', '#CBD5E1'],
        ['#1E2D3D', '#F7FAFC', '#1A202C', '#38A169', '#CBD5E0'],
      ]

      for (const swatches of ythbPresets) {
        const result = deriveDrawerTheme(swatches, BASE_THEME)
        expect(result).not.toBeNull()
        // Derived text should always be readable on the derived bg
        expect(result!.text).not.toBe(result!.bg)
        // Text should be the light surface color, not the dark swatch text
        expect(result!.text).toBe(swatches[1]) // surface
        // bgAlt/surface/border should stay DARK (close to bg), not washed-out
        // middle grays from raw swatch values
        expect(result!.bgAlt).toBe(lerpHex(swatches[0], swatches[1], 0.06))
        expect(result!.surface).toBe(lerpHex(swatches[0], swatches[1], 0.12))
        expect(result!.border).toBe(lerpHex(swatches[0], swatches[4], 0.18))
        expect(contrastRatio(result!.textMuted, result!.bg)).toBeGreaterThanOrEqual(4.5)
        expect(contrastRatio(result!.textMuted, result!.bgAlt)).toBeGreaterThanOrEqual(4.5)
      }
    })
  })
})
