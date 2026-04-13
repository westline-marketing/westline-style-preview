import type { PreviewUITheme } from '../types/index.js';
/**
 * Derive a full drawer theme from a preset's swatches array.
 *
 * Swatches convention: [bg, surface, text, accent, border].
 * Returns null when swatches are missing or insufficient, signaling
 * the caller should fall back to the base drawer theme.
 */
export declare function deriveDrawerTheme(swatches: string[] | undefined, base: PreviewUITheme & {
    isDark: boolean;
}): (PreviewUITheme & {
    isDark: boolean;
}) | null;
