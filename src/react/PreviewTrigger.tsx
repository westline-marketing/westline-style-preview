'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { TRIGGER_Z_INDEX } from '../core/constants.js'

/** Westline Marketing brand colors — always used regardless of drawer theme. */
const WM = {
  navy: '#384B5F',
  navyHover: '#475C6F',
  navyMuted: '#2E3D4D',
  green: '#5B8A72',
  gray: '#B4B4B4',
} as const

const TAB_HEIGHT = 56
const TAB_WIDTH_IDLE = 18
const TAB_WIDTH_HOVER = 24
const DRAG_THRESHOLD = 4
const DEFAULT_Y_PERCENT = 0.5
const STORAGE_KEY_SUFFIX = '-tab-y'

// ─── Reduced-motion subscription (useSyncExternalStore) ──────────────

const subscribeReduceMotion = (cb: () => void): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener?.('change', cb)
  return () => mql.removeEventListener?.('change', cb)
}
const getReduceMotionSnapshot = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
const getReduceMotionServerSnapshot = (): boolean => false

// ─── localStorage helpers ────────────────────────────────────────────

function storageKey(instanceId?: string): string {
  return (instanceId ?? 'wm-preview') + STORAGE_KEY_SUFFIX
}

function readStoredY(key: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const n = parseFloat(raw)
    if (!Number.isFinite(n)) return null
    return n
  } catch {
    return null
  }
}

function writeStoredY(key: string, y: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, String(y))
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

// ─── Viewport clamping ──────────────────────────────────────────────

/** Clamp a pixel Y so the trigger never leaves the viewport (10%-90%). */
function clampY(y: number): number {
  if (typeof window === 'undefined') return y
  const vh = window.innerHeight
  const minY = Math.round(vh * 0.1)
  const maxY = Math.round(vh * 0.9) - TAB_HEIGHT
  return Math.min(maxY, Math.max(minY, y))
}

/** Convert a stored pixel Y to a clamped value for the current viewport. */
function initialY(): number {
  if (typeof window === 'undefined') return 0
  return clampY(Math.round(window.innerHeight * DEFAULT_Y_PERCENT - TAB_HEIGHT / 2))
}

// ─── Component ───────────────────────────────────────────────────────

interface PreviewTriggerProps {
  onOpen: () => void
  onClose: () => void
  drawerOpen: boolean
  /** Namespace for localStorage position key. Uses config.instanceId when threaded through. */
  instanceId?: string
}

export function PreviewTrigger({ onOpen, onClose, drawerOpen, instanceId }: PreviewTriggerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const key = storageKey(instanceId)

  // ── Y position state ──
  const [y, setY] = useState<number>(() => {
    const stored = readStoredY(key)
    return stored !== null ? clampY(stored) : initialY()
  })

  // ── Interaction state ──
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)

  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  )

  // Ref holding drag-in-progress data (avoids stale closures).
  const dragStateRef = useRef<{
    pointerId: number
    startClientY: number
    startTop: number
    moved: boolean
  } | null>(null)

  // ── Re-clamp on resize so trigger never stays off-screen ──
  useEffect(() => {
    const onResize = () => setY((prev) => clampY(prev))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ── Pointer event handlers ──

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      const el = buttonRef.current
      if (!el) return
      el.setPointerCapture(e.pointerId)
      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientY: e.clientY,
        startTop: y,
        moved: false,
      }
    },
    [y],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const state = dragStateRef.current
      if (!state || state.pointerId !== e.pointerId) return
      const dy = e.clientY - state.startClientY
      if (!state.moved && Math.abs(dy) < DRAG_THRESHOLD) return
      if (!state.moved) {
        state.moved = true
        setDragging(true)
      }
      e.preventDefault()
      setY(clampY(state.startTop + dy))
    },
    [],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const state = dragStateRef.current
      if (!state || state.pointerId !== e.pointerId) return
      const el = buttonRef.current
      if (el && el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }
      dragStateRef.current = null
      if (!state.moved) {
        // No drag occurred — treat as a normal click.
        ;(drawerOpen ? onClose : onOpen)()
      } else {
        const finalY = clampY(state.startTop + (e.clientY - state.startClientY))
        writeStoredY(key, finalY)
        setDragging(false)
      }
    },
    [drawerOpen, onOpen, onClose, key],
  )

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const state = dragStateRef.current
      if (!state || state.pointerId !== e.pointerId) return
      const el = buttonRef.current
      if (el && el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }
      dragStateRef.current = null
      setDragging(false)
    },
    [],
  )

  // ── Derived style values ──
  const width = hovered || focused ? TAB_WIDTH_HOVER : TAB_WIDTH_IDLE
  const transitionValue = dragging
    ? 'none'
    : reduceMotion
      ? 'none'
      : 'width 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease'

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={(e) => {
        setHovered(true)
        e.currentTarget.style.backgroundColor = WM.navyHover
        if (drawerOpen) {
          e.currentTarget.style.boxShadow = `0 0 12px rgba(91,138,114,0.4), -2px 0 8px rgba(0,0,0,0.3)`
        } else {
          e.currentTarget.style.boxShadow = '-4px 0 14px rgba(0,0,0,0.4)'
        }
        const stripe = e.currentTarget.querySelector<HTMLElement>('[data-stripe]')
        if (stripe) stripe.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        e.currentTarget.style.backgroundColor = drawerOpen ? WM.navyMuted : WM.navy
        e.currentTarget.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.3)'
        const stripe = e.currentTarget.querySelector<HTMLElement>('[data-stripe]')
        if (stripe) stripe.style.opacity = drawerOpen ? '0.4' : '1'
      }}
      onFocus={(e) => {
        setFocused(true)
        e.currentTarget.style.outline = `2px solid ${WM.green}`
        e.currentTarget.style.outlineOffset = '2px'
      }}
      onBlur={(e) => {
        setFocused(false)
        e.currentTarget.style.outline = 'none'
      }}
      aria-label={drawerOpen ? 'Close style preview' : 'Open style preview'}
      style={{
        all: 'initial',
        position: 'fixed',
        right: '0',
        top: `${y}px`,
        width: `${width}px`,
        height: `${TAB_HEIGHT}px`,
        borderRadius: '6px 0 0 6px',
        backgroundColor: drawerOpen ? WM.navyMuted : WM.navy,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        borderRight: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: TRIGGER_Z_INDEX,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.3)',
        transition: transitionValue,
        overflow: 'hidden',
        opacity: drawerOpen ? 0.7 : 1,
        touchAction: 'none',
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
          transition: reduceMotion ? 'none' : 'opacity 0.2s ease',
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
          transition: reduceMotion ? 'none' : 'transform 0.2s ease',
        }}
      >
        <path d="M6.5 1.5L2 7l4.5 5.5" stroke={WM.gray} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
