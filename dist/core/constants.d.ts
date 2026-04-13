/**
 * Style Preview constants.
 *
 * Z-index stacking contract:
 *   Trigger (40) < Storefront header/nav (50) < Drawer/Backdrop (60)
 *   Trigger stays below site chrome; drawer is a modal overlay above everything.
 */
export declare const DEFAULT_STORAGE_KEY = "wm-preview";
export declare const DEFAULT_QUERY_PARAM = "previewStyle";
export declare const PREPAINT_STYLE_ID = "wm-prepaint";
export declare const DATA_ATTRIBUTE = "data-preview-style";
export declare const TRIGGER_Z_INDEX = 40;
export declare const DRAWER_Z_INDEX = 60;
export declare const BACKDROP_Z_INDEX = 60;
export declare const TRANSITION_MS = 200;
