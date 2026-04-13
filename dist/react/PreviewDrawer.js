'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useCallback, useState } from 'react';
import { DEFAULT_UI_THEME } from '../types/index.js';
import { DRAWER_Z_INDEX, BACKDROP_Z_INDEX, TRANSITION_MS } from '../core/constants.js';
import { PresetCard } from './PresetCard.js';
import { WestlineLogo } from './WestlineLogo.js';
export function PreviewDrawer({ isOpen, onClose, presets, activePresetId, onSelectPreset, onReset, previewUrl, theme = DEFAULT_UI_THEME, }) {
    const drawerRef = useRef(null);
    const previousFocusRef = useRef(null);
    const [isDesktop, setIsDesktop] = useState(true);
    const isDark = 'isDark' in theme ? theme.isDark : true;
    const radius = theme.borderRadius ?? '6px';
    const shadow = theme.shadowElevation ?? '0 8px 32px rgba(0,0,0,0.6)';
    const backdropTint = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(28,25,23,0.25)';
    // Responsive check (avoids SSR window access in style object)
    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    // Focus trap
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key !== 'Tab')
            return;
        const drawer = drawerRef.current;
        if (!drawer)
            return;
        const focusable = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0)
            return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        }
        else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, [onClose]);
    // Focus management + keyboard listener
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => {
                const drawer = drawerRef.current;
                if (drawer) {
                    const first = drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    first?.focus();
                }
            }, TRANSITION_MS);
        }
        else {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);
    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    const handleCopyUrl = useCallback(() => {
        navigator.clipboard?.writeText(previewUrl);
    }, [previewUrl]);
    if (!isOpen)
        return null;
    const focusStyle = (e) => {
        e.currentTarget.style.outline = `2px solid ${theme.accent}`;
        e.currentTarget.style.outlineOffset = '2px';
    };
    const blurStyle = (e) => {
        e.currentTarget.style.outline = 'none';
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { onClick: onClose, style: {
                    all: 'initial',
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: backdropTint,
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                    zIndex: BACKDROP_Z_INDEX,
                } }), _jsxs("div", { ref: drawerRef, role: "dialog", "aria-modal": "true", "aria-label": "Style preview", style: {
                    all: 'initial',
                    position: 'fixed',
                    zIndex: DRAWER_Z_INDEX,
                    backgroundColor: theme.bg,
                    border: `1px solid ${theme.border}`,
                    boxShadow: shadow,
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: theme.fontBody,
                    ...(isDesktop
                        ? {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '320px',
                            borderLeft: `1px solid ${theme.border}`,
                            borderRadius: 0,
                        }
                        : {
                            left: 0,
                            right: 0,
                            bottom: 0,
                            maxHeight: '70vh',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                            borderTop: `1px solid ${theme.border}`,
                        }),
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '16px',
                            borderBottom: `1px solid ${theme.border}`,
                            flexShrink: 0,
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    alignItems: 'flex-start',
                                    minWidth: 0,
                                }, children: [_jsx(WestlineLogo, { isDark: isDark, height: 22 }), _jsx("span", { style: {
                                            fontSize: '11px',
                                            fontWeight: 500,
                                            color: theme.textMuted,
                                            fontFamily: theme.fontBody,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                        }, children: "Style Preview" })] }), _jsx("button", { onClick: onClose, "aria-label": "Close style preview", onFocus: focusStyle, onBlur: blurStyle, style: {
                                    all: 'initial',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    borderRadius: radius,
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: theme.textMuted,
                                }, children: _jsx("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", style: { display: 'block' }, children: _jsx("path", { d: "M1 1l12 12M13 1L1 13", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }) }) })] }), _jsx("div", { style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }, children: presets.map((preset) => (_jsx(PresetCard, { preset: preset, isActive: preset.id === activePresetId, onClick: () => onSelectPreset(preset.id), theme: theme }, preset.id))) }), _jsxs("div", { style: {
                            padding: '12px 16px',
                            borderTop: `1px solid ${theme.border}`,
                            display: 'flex',
                            gap: '8px',
                            flexShrink: 0,
                        }, children: [_jsx("button", { onClick: onReset, onFocus: focusStyle, onBlur: blurStyle, style: {
                                    all: 'initial',
                                    flex: 1,
                                    minHeight: '34px',
                                    padding: '4px 12px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: theme.textMuted,
                                    backgroundColor: theme.bgAlt,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: radius,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontFamily: theme.fontBody,
                                }, children: "Reset" }), _jsx("button", { onClick: handleCopyUrl, onFocus: focusStyle, onBlur: blurStyle, style: {
                                    all: 'initial',
                                    flex: 1,
                                    minHeight: '34px',
                                    padding: '4px 12px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#FFFFFF',
                                    backgroundColor: theme.accent,
                                    border: 'none',
                                    borderRadius: radius,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontFamily: theme.fontBody,
                                }, children: "Copy Link" })] })] })] }));
}
