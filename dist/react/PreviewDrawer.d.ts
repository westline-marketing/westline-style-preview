import type { StylePreset, PreviewUITheme } from '../types/index.js';
interface PreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    presets: StylePreset[];
    activePresetId: string;
    onSelectPreset: (id: string) => void;
    onReset: () => void;
    previewUrl: string;
    theme?: PreviewUITheme & {
        isDark?: boolean;
    };
}
export declare function PreviewDrawer({ isOpen, onClose, presets, activePresetId, onSelectPreset, onReset, previewUrl, theme, }: PreviewDrawerProps): import("react/jsx-runtime").JSX.Element | null;
export {};
