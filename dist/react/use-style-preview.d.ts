import type { PreviewConfig } from '../types/index.js';
export interface UseStylePreviewReturn {
    activePresetId: string;
    targetFound: boolean;
    setPreset: (id: string) => void;
    resetPreset: () => void;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    previewUrl: string;
}
interface UseStylePreviewOptions {
    enabled?: boolean;
}
export declare function useStylePreview(config: PreviewConfig, options?: UseStylePreviewOptions): UseStylePreviewReturn;
export {};
