import { DATA_ATTRIBUTE } from './constants.js';
export function collectAllVarKeys(presets) {
    const keys = new Set();
    for (const preset of presets) {
        for (const key of Object.keys(preset.variables)) {
            keys.add(key);
        }
    }
    return Array.from(keys);
}
export function applyPreset(el, preset, allVarKeys, allowedTokens) {
    for (const key of allVarKeys) {
        el.style.removeProperty(key);
    }
    for (const [key, value] of Object.entries(preset.variables)) {
        if (allowedTokens && !allowedTokens.includes(key))
            continue;
        el.style.setProperty(key, value);
    }
    el.setAttribute(DATA_ATTRIBUTE, preset.id);
}
export function clearPreset(el, allVarKeys) {
    for (const key of allVarKeys) {
        el.style.removeProperty(key);
    }
    el.removeAttribute(DATA_ATTRIBUTE);
}
