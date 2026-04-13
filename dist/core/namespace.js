import { DEFAULT_STORAGE_KEY, PREPAINT_STYLE_ID } from './constants.js';
export function resolveStorageNamespace(options = {}) {
    return options.instanceId ?? options.storageKey ?? DEFAULT_STORAGE_KEY;
}
export function resolveLegacyStorageKey(options = {}) {
    if (!options.instanceId || !options.storageKey)
        return null;
    return options.instanceId === options.storageKey ? null : options.storageKey;
}
export function getPrepaintStyleId(options = {}) {
    return `${PREPAINT_STYLE_ID}-${resolveStorageNamespace(options)}`;
}
