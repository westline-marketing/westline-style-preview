'use client'

import { TRIGGER_Z_INDEX } from '../core/constants.js'

/** Westline Marketing brand colors — always used regardless of drawer theme. */
const WM = {
  navy: '#384B5F',
  navyHover: '#475C6F',
  navyMuted: '#2E3D4D',
  green: '#5B8A72',
  gray: '#B4B4B4',
} as const

interface PreviewTriggerProps {
  onOpen: () => void
  onClose: () => void
  drawerOpen: boolean
}

export function PreviewTrigger({ onOpen, onClose, drawerOpen }: PreviewTriggerProps) {
  const handleClick = drawerOpen ? onClose : onOpen

  return (
    <button
      onClick={handleClick}
      aria-label={drawerOpen ? 'Close style preview' : 'Open style preview'}
      style={{
        all: 'initial',
        position: 'fixed',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '18px',
        height: '56px',
        borderRadius: '6px 0 0 6px',
        backgroundColor: drawerOpen ? WM.navyMuted : WM.navy,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        borderRight: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: TRIGGER_Z_INDEX,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.3)',
        transition: 'width 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
        overflow: 'hidden',
        opacity: drawerOpen ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.width = '24px'
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.backgroundColor = WM.navyHover
        if (drawerOpen) {
          e.currentTarget.style.boxShadow = `0 0 12px rgba(91,138,114,0.4), -2px 0 8px rgba(0,0,0,0.3)`
        } else {
          e.currentTarget.style.boxShadow = '-4px 0 14px rgba(0,0,0,0.4)'
        }
        // Restore accent stripe opacity
        const stripe = e.currentTarget.querySelector<HTMLElement>('[data-stripe]')
        if (stripe) stripe.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.width = '18px'
        e.currentTarget.style.opacity = drawerOpen ? '0.7' : '1'
        e.currentTarget.style.backgroundColor = drawerOpen ? WM.navyMuted : WM.navy
        e.currentTarget.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.3)'
        // Mute accent stripe when drawer is open
        const stripe = e.currentTarget.querySelector<HTMLElement>('[data-stripe]')
        if (stripe) stripe.style.opacity = drawerOpen ? '0.4' : '1'
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${WM.green}`
        e.currentTarget.style.outlineOffset = '2px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none'
      }}
    >
      {/* Accent edge stripe */}
      <span
        aria-hidden="true"
        data-stripe=""
        style={{
          position: 'absolute',
          left: '0',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: WM.green,
          borderRadius: '0 1px 1px 0',
          opacity: drawerOpen ? 0.4 : 1,
          transition: 'opacity 0.2s ease',
        }}
      />
      {/* Chevron — points left (open) or right (close) */}
      <svg
        width="8"
        height="14"
        viewBox="0 0 8 14"
        fill="none"
        aria-hidden="true"
        style={{
          display: 'block',
          marginLeft: '2px',
          flexShrink: 0,
          transform: drawerOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease',
        }}
      >
        <path d="M6.5 1.5L2 7l4.5 5.5" stroke={WM.gray} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
