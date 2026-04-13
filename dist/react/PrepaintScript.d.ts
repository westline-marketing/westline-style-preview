import type { PreviewConfig } from '../types/index.js';
interface PrepaintScriptProps {
    config: PreviewConfig;
    /**
     * Whether the preview feature is enabled. When omitted, falls back to
     * checking `process.env.NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true'`
     * so Next.js consumers can gate via env vars. Non-Next consumers should
     * pass this explicitly.
     */
    enabled?: boolean;
}
export declare function PrepaintScript({ config, enabled }: PrepaintScriptProps): import("react/jsx-runtime").JSX.Element | null;
export {};
