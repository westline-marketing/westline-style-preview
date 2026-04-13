/**
 * Parse a CSS border-radius value to a numeric pixel value.
 *
 * Accepts unitless numbers ('10', '0') and px values ('10px', '0px', '12.5px').
 * Rejects rem, em, %, var(), and other non-px units → returns fallback.
 * Preserves zero correctly: '0' → 0, '0px' → 0.
 */
const PX_PATTERN = /^(-?\d+(?:\.\d+)?)(px)?$/i

export function parseRadius(value: string | undefined, fallback: number): number {
  if (value == null || value === '') return fallback
  const trimmed = value.trim()
  const match = trimmed.match(PX_PATTERN)
  if (!match) return fallback
  const num = parseFloat(match[1])
  return Number.isFinite(num) ? num : fallback
}
