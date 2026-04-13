'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { resolveDrawerTheme, parsePreviewDrawerParam } from '../themes/index.js';
import { deriveDrawerTheme } from '../themes/derive.js';
import { useStylePreview } from './use-style-preview.js';
import { PreviewTrigger } from './PreviewTrigger.js';
import { PreviewDrawer } from './PreviewDrawer.js';
export function StylePreview({ config, enabled }) {
    const isEnabled = enabled ?? process.env.NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true';
    const [mounted, setMounted] = useState(false);
    // Dev-mode: allow ?previewDrawer=techie|studio|rustic to override theme
    const themeConfig = useMemo(() => {
        if (process.env.NODE_ENV === 'production')
            return config;
        if (typeof window === 'undefined')
            return config;
        const params = new URLSearchParams(window.location.search);
        const override = parsePreviewDrawerParam(params.get('previewDrawer'));
        if (!override)
            return config;
        return { ...config, drawerTheme: override };
    }, [config]);
    const { activePresetId, targetFound, setPreset, resetPreset, isDrawerOpen, openDrawer, closeDrawer, previewUrl, } = useStylePreview(config, { enabled: isEnabled });
    useEffect(() => {
        startTransition(() => setMounted(true));
    }, []);
    const baseTheme = useMemo(() => resolveDrawerTheme(themeConfig), [themeConfig]);
    const theme = useMemo(() => {
        const activePreset = config.presets.find((p) => p.id === activePresetId);
        if (!activePreset || activePresetId === config.defaultStyleId)
            return baseTheme;
        return deriveDrawerTheme(activePreset.swatches, baseTheme) ?? baseTheme;
    }, [activePresetId, config.presets, config.defaultStyleId, baseTheme]);
    if (!isEnabled)
        return null;
    if (!mounted || !targetFound)
        return null;
    return createPortal(_jsxs(_Fragment, { children: [_jsx(PreviewTrigger, { onOpen: openDrawer, onClose: closeDrawer, drawerOpen: isDrawerOpen }), _jsx(PreviewDrawer, { isOpen: isDrawerOpen, onClose: closeDrawer, presets: config.presets, activePresetId: activePresetId, onSelectPreset: setPreset, onReset: resetPreset, previewUrl: previewUrl, theme: theme })] }), document.body);
}
