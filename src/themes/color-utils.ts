/** Parse a hex color string (#RGB or #RRGGBB) to an [r, g, b] tuple. */
export function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [0, 0, 0]
  }
  return [r, g, b]
}

/** Linearly interpolate between two hex colors. t=0 returns `a`, t=1 returns `b`. */
export function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a)
  const [br, bg, bb] = parseHex(b)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

/** WCAG 2.x relative luminance from a hex color string. */
export function wcagLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex)
  const [rL, gL, bL] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL
}

/** WCAG contrast ratio between two hex colors (always >= 1). */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = wcagLuminance(hex1)
  const l2 = wcagLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Pick #000000 or #FFFFFF — whichever has higher contrast against the accent. */
export function pickAccentForeground(accentHex: string): string {
  const blackContrast = contrastRatio(accentHex, '#000000')
  const whiteContrast = contrastRatio(accentHex, '#FFFFFF')
  return blackContrast >= whiteContrast ? '#000000' : '#FFFFFF'
}
