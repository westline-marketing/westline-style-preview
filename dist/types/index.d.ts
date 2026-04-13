export type CSSVariableMap = Record<string, string>;
export type DrawerThemeName = 'auto' | 'techie' | 'studio' | 'rustic';
export interface StylePreset {
    id: string;
    label: string;
    description?: string;
    variables: CSSVariableMap;
    swatches?: string[];
}
export interface PreviewUITheme {
    bg: string;
    bgAlt: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    fontBody: string;
    fontHeading: string;
    borderRadius?: string;
    shadowElevation?: string;
    isDark?: boolean;
}
export interface PreviewConfig {
    defaultStyleId: string;
    queryParam?: string;
    storageKey?: string;
    /**
     * Unique identifier for this preview instance. Used to namespace storage
     * keys and prepaint style IDs to prevent collisions when multiple preview
     * instances coexist. Defaults to the storageKey value when omitted.
     */
    instanceId?: string;
    targetSelector: string;
    presets: StylePreset[];
    allowedTokens?: string[];
    /** Named drawer theme. Defaults to 'auto' (derives from active preset swatches).
     *  Set to 'studio', 'techie', or 'rustic' to lock the drawer to a static theme. */
    drawerTheme?: DrawerThemeName;
    /** Explicit UI theme override. Takes precedence over drawerTheme. */
    uiTheme?: PreviewUITheme;
}
/**
 * Default preview UI skin — dark industrial fallback theme.
 * Consumers should use drawerTheme or uiTheme in their config
 * instead of relying on this directly.
 */
export declare const DEFAULT_UI_THEME: PreviewUITheme;
