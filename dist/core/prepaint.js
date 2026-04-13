import { DEFAULT_QUERY_PARAM } from './constants.js';
import { getPrepaintStyleId, resolveLegacyStorageKey, resolveStorageNamespace } from './namespace.js';
function serializeForInlineScript(value) {
    return JSON.stringify(value)
        .replace(/</g, '\\u003C')
        .replace(/>/g, '\\u003E')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}
export function generatePrepaintScript(config) {
    const storageKey = resolveStorageNamespace(config);
    const legacyStorageKey = resolveLegacyStorageKey(config);
    const queryParam = config.queryParam ?? DEFAULT_QUERY_PARAM;
    const styleId = getPrepaintStyleId(config);
    const selector = config.targetSelector;
    const allowed = config.allowedTokens;
    const presetMap = {};
    for (const preset of config.presets) {
        const vars = Object.fromEntries(Object.entries(preset.variables).filter(([k]) => !allowed || allowed.includes(k)));
        if (Object.keys(vars).length === 0)
            continue;
        presetMap[preset.id] = vars;
    }
    if (Object.keys(presetMap).length === 0)
        return '';
    const mapJson = serializeForInlineScript(presetMap);
    const storageKeyJson = serializeForInlineScript(storageKey);
    const legacyStorageKeyJson = serializeForInlineScript(legacyStorageKey);
    const queryParamJson = serializeForInlineScript(queryParam);
    const styleIdJson = serializeForInlineScript(styleId);
    const selectorJson = serializeForInlineScript(selector);
    return `(function(){try{var m=${mapJson};var k=${storageKeyJson};var lk=${legacyStorageKeyJson};var q=${queryParamJson};var id=${styleIdJson};var s=${selectorJson};var p=null;try{var u=new URLSearchParams(location.search);var qv=u.get(q);if(qv&&m[qv]){p=qv;try{sessionStorage.setItem(k,qv);if(lk){sessionStorage.removeItem(lk)}}catch(e){}}else{try{p=sessionStorage.getItem(k);if((!p||!m[p])&&lk){var legacy=sessionStorage.getItem(lk);if(legacy&&m[legacy]){p=legacy;try{sessionStorage.setItem(k,legacy);sessionStorage.removeItem(lk)}catch(e){}}}}catch(e){}}}catch(e){}if(!p||!m[p])return;var vars=m[p];var css=s+"{"+Object.keys(vars).map(function(key){return key+":"+vars[key]}).join(";")+"}";var ex=document.getElementById(id);if(ex){ex.textContent=css}else{var el=document.createElement("style");el.id=id;el.textContent=css;document.head.appendChild(el)}}catch(e){}})();`;
}
