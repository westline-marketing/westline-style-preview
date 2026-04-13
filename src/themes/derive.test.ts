import { describe, it, expect } from 'vitest'
import { parseHex, lerpHex } from './color-utils.js'
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
    expect(result!.surface).toBe('#23272F')
    expect(result!.text).toBe('#F0F0F0')
    expect(result!.accent).toBe('#E8930C')
    expect(result!.border).toBe('#2E3440')
  })

  it('computes bgAlt as midpoint of bg and surface', () => {
    const swatches = ['#000000', '#ffffff', '#F0F0F0', '#E8930C', '#2E3440']
    const result = deriveDrawerTheme(swatches, BASE_THEME)
    expect(result!.bgAlt).toBe('#808080')
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
})
