import type { PreviewConfig } from '../types/index.js';
interface StylePreviewProps {
    config: PreviewConfig;
    /**
     * Whether the preview feature is enabled. When omitted, falls back to
     * checking `process.env.NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true'`
     * so Next.js consumers can gate via env vars. Non-Next consumers should
     * pass this explicitly.
     */
    enabled?: boolean;
}
export declare function StylePreview({ config, enabled }: StylePreviewProps): import("react").ReactPortal | null;
export {};
