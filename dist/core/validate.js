export function validatePreset(preset, allowedTokens) {
    if (!preset.id || !preset.label)
        return false;
    if (!preset.variables || typeof preset.variables !== 'object')
        return false;
    if (allowedTokens) {
        for (const key of Object.keys(preset.variables)) {
            if (!allowedTokens.includes(key))
                return false;
        }
    }
    return true;
}
export function findPreset(id, presets) {
    return presets.find((p) => p.id === id);
}
