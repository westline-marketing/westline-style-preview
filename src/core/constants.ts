/**
 * Style Preview constants.
 *
 * Z-index stacking contract:
 *   Trigger (40) < Storefront header/nav (50) < Drawer/Backdrop (60)
 *   Trigger stays below site chrome; drawer is a modal overlay above everything.
 */

export const DEFAULT_STORAGE_KEY = 'wm-preview'
export const DEFAULT_QUERY_PARAM = 'previewStyle'
export const PREPAINT_STYLE_ID = 'wm-prepaint'
export const DATA_ATTRIBUTE = 'data-preview-style'
export const TRIGGER_Z_INDEX = 40
export const DRAWER_Z_INDEX = 60
export const BACKDROP_Z_INDEX = 60
export const TRANSITION_MS = 200
