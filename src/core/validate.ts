import type { StylePreset } from '../types/index.js'

const REQUIRED_SWATCH_COUNT = 5

export function validatePreset(
  preset: StylePreset,
  allowedTokens?: string[]
): boolean {
  if (!preset.id || !preset.label) return false
  if (!preset.variables || typeof preset.variables !== 'object') return false
  if (allowedTokens) {
    for (const key of Object.keys(preset.variables)) {
      if (!allowedTokens.includes(key)) return false
    }
  }

  // Warn in dev when a non-default preset is missing swatches for auto drawer theming
  const hasVariables = Object.keys(preset.variables).length > 0
  if (
    hasVariables &&
    process.env.NODE_ENV !== 'production' &&
    (!preset.swatches || preset.swatches.length < REQUIRED_SWATCH_COUNT)
  ) {
    console.warn(
      `[style-preview] Preset "${preset.id}" has ${preset.swatches?.length ?? 0} swatches (${REQUIRED_SWATCH_COUNT} required for auto drawer theming)`
    )
  }

  return true
}

export function findPreset(
  id: string,
  presets: StylePreset[]
): StylePreset | undefined {
  return presets.find((p) => p.id === id)
}
