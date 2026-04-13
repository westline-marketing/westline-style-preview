import { DEFAULT_STORAGE_KEY, PREPAINT_STYLE_ID } from './constants.js'

export interface PreviewNamespaceOptions {
  instanceId?: string
  storageKey?: string
}

export function resolveStorageNamespace(options: PreviewNamespaceOptions = {}): string {
  return options.instanceId ?? options.storageKey ?? DEFAULT_STORAGE_KEY
}

export function resolveLegacyStorageKey(options: PreviewNamespaceOptions = {}): string | null {
  if (!options.instanceId || !options.storageKey) return null
  return options.instanceId === options.storageKey ? null : options.storageKey
}

export function getPrepaintStyleId(options: PreviewNamespaceOptions = {}): string {
  return `${PREPAINT_STYLE_ID}-${resolveStorageNamespace(options)}`
}
