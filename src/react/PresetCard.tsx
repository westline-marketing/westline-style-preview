'use client'

import type { StylePreset, PreviewUITheme } from '../types/index.js'
import { DEFAULT_UI_THEME } from '../types/index.js'

interface PresetCardProps {
  preset: StylePreset
  isActive: boolean
  onClick: () => void
  theme?: PreviewUITheme
}

export function PresetCard({ preset, isActive, onClick, theme = DEFAULT_UI_THEME }: PresetCardProps) {
  const swatches = preset.swatches ?? []
  const inactiveBorder = `${theme.border}88`

  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      style={{
        all: 'initial',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '10px',
        width: '100%',
        minHeight: '44px',
        padding: '10px 12px',
        borderRadius: theme.borderRadius ?? '8px',
        border: isActive ? `2px solid ${theme.accent}` : `2px solid ${inactiveBorder}`,
        backgroundColor: isActive ? `${theme.accent}14` : theme.bgAlt,
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        boxSizing: 'border-box',
        fontFamily: theme.fontBody,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = theme.textMuted
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = inactiveBorder
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${theme.accent}`
        e.currentTarget.style.outlineOffset = '2px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none'
      }}
    >
      {/* Swatches (top) + label / description (below), left-aligned */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '6px',
          textAlign: 'left',
        }}
      >
        {swatches.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              alignItems: 'center',
            }}
          >
            {swatches.map((color, i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: `1px solid ${theme.border}`,
                }}
              />
            ))}
          </div>
        )}
        <div style={{ width: '100%' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: theme.fontHeading,
              color: theme.text,
              lineHeight: 1.25,
            }}
          >
            {preset.label}
          </div>
          {preset.description && (
            <div
              style={{
                fontSize: '12px',
                color: theme.textMuted,
                lineHeight: 1.35,
                marginTop: '2px',
              }}
            >
              {preset.description}
            </div>
          )}
        </div>
      </div>

      {/* Active checkmark — top-right */}
      {isActive && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0, marginTop: '1px' }}
        >
          <circle cx="9" cy="9" r="9" fill={theme.accent} />
          <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
