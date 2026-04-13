import type { DrawerThemeName, PreviewUITheme, PreviewConfig } from '../types/index.js';
/**
 * Built-in drawer chrome themes.
 *
 * techie  — dark, electric blue accent, sharp corners, monospace headings
 * studio  — light, Westline green accent, soft radius, clean sans-serif
 * rustic  — warm dark, copper accent, sturdy industrial fonts
 */
export declare const DRAWER_THEMES: Record<DrawerThemeName, PreviewUITheme>;
/** Parse a hex color and return whether it's dark (luminance < 0.5). */
export declare function isThemeDark(hexBg: string): boolean;
/**
 * Resolve the drawer theme from a PreviewConfig.
 *
 * Priority: explicit uiTheme > named drawerTheme > 'studio' default.
 * Always returns isDark (computed from bg if not set).
 */
export declare function resolveDrawerTheme(config: PreviewConfig): PreviewUITheme & {
    isDark: boolean;
};
/** Parse `?previewDrawer=` value (development preview only). */
export declare function parsePreviewDrawerParam(value: string | null): DrawerThemeName | undefined;
