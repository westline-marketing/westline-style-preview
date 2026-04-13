import { DEFAULT_QUERY_PARAM } from './constants.js'
import { resolveLegacyStorageKey, resolveStorageNamespace } from './namespace.js'
import type { PreviewNamespaceOptions } from './namespace.js'

export function getStoredPresetId(options: PreviewNamespaceOptions = {}): string | null {
  if (typeof window === 'undefined') return null
  const storageKey = resolveStorageNamespace(options)
  const legacyStorageKey = resolveLegacyStorageKey(options)
  try {
    const namespacedPresetId = sessionStorage.getItem(storageKey)
    if (namespacedPresetId) return namespacedPresetId

    if (!legacyStorageKey) return null

    const legacyPresetId = sessionStorage.getItem(legacyStorageKey)
    if (!legacyPresetId) return null

    sessionStorage.setItem(storageKey, legacyPresetId)
    sessionStorage.removeItem(legacyStorageKey)
    return legacyPresetId
  } catch {
    return null
  }
}

export function storePresetId(id: string, options: PreviewNamespaceOptions = {}): void {
  if (typeof window === 'undefined') return
  const storageKey = resolveStorageNamespace(options)
  try {
    sessionStorage.setItem(storageKey, id)
  } catch {
    // sessionStorage unavailable (private browsing, etc.)
  }
}

export function clearStoredPreset(options: PreviewNamespaceOptions = {}): void {
  if (typeof window === 'undefined') return
  const storageKey = resolveStorageNamespace(options)
  const legacyStorageKey = resolveLegacyStorageKey(options)
  try {
    sessionStorage.removeItem(storageKey)
    if (legacyStorageKey) {
      sessionStorage.removeItem(legacyStorageKey)
    }
  } catch {
    // ignore
  }
}

export function getPresetIdFromUrl(param = DEFAULT_QUERY_PARAM): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    return url.searchParams.get(param)
  } catch {
    return null
  }
}

export function buildPreviewUrl(presetId: string, defaultId: string, param = DEFAULT_QUERY_PARAM): string {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  if (presetId && presetId !== defaultId) {
    url.searchParams.set(param, presetId)
  } else {
    url.searchParams.delete(param)
  }
  return url.toString()
}

export function clearUrlParam(param = DEFAULT_QUERY_PARAM): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param)
      window.history.replaceState({}, '', url.toString())
    }
  } catch {
    // ignore
  }
}
