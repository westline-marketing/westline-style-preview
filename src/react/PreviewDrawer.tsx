'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { StylePreset, PreviewUITheme } from '../types/index.js'
import { DEFAULT_UI_THEME } from '../types/index.js'
import { DRAWER_Z_INDEX, BACKDROP_Z_INDEX, TRANSITION_MS, TOKEN_TRANSITION_MS } from '../core/constants.js'
import { PresetCard } from './PresetCard.js'
import { WestlineLogo } from './WestlineLogo.js'

interface PreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  presets: StylePreset[]
  activePresetId: string
  onSelectPreset: (id: string) => void
  onReset: () => void
  previewUrl: string
  theme?: PreviewUITheme & { isDark?: boolean }
}

export function PreviewDrawer({
  isOpen,
  onClose,
  presets,
  activePresetId,
  onSelectPreset,
  onReset,
  previewUrl,
  theme = DEFAULT_UI_THEME,
}: PreviewDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [isDesktop, setIsDesktop] = useState(true)

  const isDark = 'isDark' in theme ? theme.isDark : true
  const radius = theme.borderRadius ?? '6px'
  const shadow = theme.shadowElevation ?? '0 8px 32px rgba(0,0,0,0.6)'
  const backdropTint = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(28,25,23,0.25)'

  // Responsive check (avoids SSR window access in style object)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const drawer = drawerRef.current
      if (!drawer) return

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose]
  )

  // Focus management + keyboard listener
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.addEventListener('keydown', handleKeyDown)
      setTimeout(() => {
        const drawer = drawerRef.current
        if (drawer) {
          const first = drawer.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          first?.focus()
        }
      }, TRANSITION_MS)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard?.writeText(previewUrl)
  }, [previewUrl])

  if (!isOpen) return null

  const focusStyle = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.outline = `2px solid ${theme.accent}`
    e.currentTarget.style.outlineOffset = '2px'
  }
  const blurStyle = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.outline = 'none'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          all: 'initial',
          position: 'fixed',
          inset: 0,
          backgroundColor: backdropTint,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          transition: `background-color ${TOKEN_TRANSITION_MS}ms ease`,
          zIndex: BACKDROP_Z_INDEX,
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Style preview"
        style={{
          all: 'initial',
          position: 'fixed',
          zIndex: DRAWER_Z_INDEX,
          backgroundColor: theme.bg,
          border: `1px solid ${theme.border}`,
          boxShadow: shadow,
          transition: `background-color ${TOKEN_TRANSITION_MS}ms ease, border-color ${TOKEN_TRANSITION_MS}ms ease, box-shadow ${TOKEN_TRANSITION_MS}ms ease`,
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
        }}
      >
        {/* Header — logo + subheading */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: `1px solid ${theme.border}`,
            transition: `border-color ${TOKEN_TRANSITION_MS}ms ease`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'flex-start',
              minWidth: 0,
            }}
          >
            <WestlineLogo isDark={isDark} height={22} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: theme.textMuted,
                transition: `color ${TOKEN_TRANSITION_MS}ms ease`,
                fontFamily: theme.fontBody,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Style Preview
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close style preview"
            onFocus={focusStyle}
            onBlur={blurStyle}
            style={{
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
              transition: `color ${TOKEN_TRANSITION_MS}ms ease`,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'block' }}>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Preset list */}
          <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={preset.id === activePresetId}
              onClick={() => onSelectPreset(preset.id)}
              theme={theme}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${theme.border}`,
            transition: `border-color ${TOKEN_TRANSITION_MS}ms ease`,
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onReset}
            onFocus={focusStyle}
            onBlur={blurStyle}
            style={{
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
              transition: `background-color ${TOKEN_TRANSITION_MS}ms ease, border-color ${TOKEN_TRANSITION_MS}ms ease, color ${TOKEN_TRANSITION_MS}ms ease`,
            }}
          >
            Reset
          </button>
          <button
            onClick={handleCopyUrl}
            onFocus={focusStyle}
            onBlur={blurStyle}
            style={{
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
              transition: `background-color ${TOKEN_TRANSITION_MS}ms ease, color ${TOKEN_TRANSITION_MS}ms ease`,
            }}
          >
            Copy Link
          </button>
        </div>
      </div>
    </>
  )
}
