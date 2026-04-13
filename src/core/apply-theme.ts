import { DATA_ATTRIBUTE } from './constants.js'
import type { StylePreset } from '../types/index.js'

export function collectAllVarKeys(presets: StylePreset[]): string[] {
  const keys = new Set<string>()
  for (const preset of presets) {
    for (const key of Object.keys(preset.variables)) {
      keys.add(key)
    }
  }
  return Array.from(keys)
}

export function applyPreset(
  el: HTMLElement,
  preset: StylePreset,
  allVarKeys: string[],
  allowedTokens?: string[]
): void {
  for (const key of allVarKeys) {
    el.style.removeProperty(key)
  }
  for (const [key, value] of Object.entries(preset.variables)) {
    if (allowedTokens && !allowedTokens.includes(key)) continue
    el.style.setProperty(key, value)
  }
  el.setAttribute(DATA_ATTRIBUTE, preset.id)
}

export function clearPreset(el: HTMLElement, allVarKeys: string[]): void {
  for (const key of allVarKeys) {
    el.style.removeProperty(key)
  }
  el.removeAttribute(DATA_ATTRIBUTE)
}
