import type { PreviewNamespaceOptions } from './namespace.js';
export declare function getStoredPresetId(options?: PreviewNamespaceOptions): string | null;
export declare function storePresetId(id: string, options?: PreviewNamespaceOptions): void;
export declare function clearStoredPreset(options?: PreviewNamespaceOptions): void;
export declare function getPresetIdFromUrl(param?: string): string | null;
export declare function buildPreviewUrl(presetId: string, defaultId: string, param?: string): string;
export declare function clearUrlParam(param?: string): void;
