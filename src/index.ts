// === Server-safe public API ===

// Types
export type { StylePreset, PreviewConfig, CSSVariableMap, PreviewUITheme, DrawerThemeName } from './types/index.js'
export { DEFAULT_UI_THEME } from './types/index.js'

// Themes
export {
  DRAWER_THEMES,
  resolveDrawerTheme,
  parsePreviewDrawerParam,
} from './themes/index.js'
export { deriveDrawerTheme } from './themes/derive.js'
export { parseHex, lerpHex, wcagLuminance, contrastRatio } from './themes/color-utils.js'

// Server-safe React component
export { PrepaintScript } from './react/PrepaintScript.js'

// Pure validation utilities — safe to import from server or client
export { validatePreset, findPreset } from './core/validate.js'
