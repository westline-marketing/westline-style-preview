import type { StylePreset } from '../types/index.js';
export declare function validatePreset(preset: StylePreset, allowedTokens?: string[]): boolean;
export declare function findPreset(id: string, presets: StylePreset[]): StylePreset | undefined;
