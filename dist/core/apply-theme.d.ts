import type { StylePreset } from '../types/index.js';
export declare function collectAllVarKeys(presets: StylePreset[]): string[];
export declare function applyPreset(el: HTMLElement, preset: StylePreset, allVarKeys: string[], allowedTokens?: string[]): void;
export declare function clearPreset(el: HTMLElement, allVarKeys: string[]): void;
