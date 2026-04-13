// === Server-safe public API ===
export { DEFAULT_UI_THEME } from './types/index.js';
// Themes
export { DRAWER_THEMES, resolveDrawerTheme, parsePreviewDrawerParam, } from './themes/index.js';
// Server-safe React component
export { PrepaintScript } from './react/PrepaintScript.js';
// Pure validation utilities — safe to import from server or client
export { validatePreset, findPreset } from './core/validate.js';
