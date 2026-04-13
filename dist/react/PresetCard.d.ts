import type { StylePreset, PreviewUITheme } from '../types/index.js';
interface PresetCardProps {
    preset: StylePreset;
    isActive: boolean;
    onClick: () => void;
    theme?: PreviewUITheme;
}
export declare function PresetCard({ preset, isActive, onClick, theme }: PresetCardProps): import("react/jsx-runtime").JSX.Element;
export {};
