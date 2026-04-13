// @vitest-environment jsdom

// Tell React 19 that we are inside an act() test environment.
declare const globalThis: { IS_REACT_ACT_ENVIRONMENT: boolean }
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createElement, act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PreviewTrigger } from './PreviewTrigger.js'
import { TRANSITION_MS, TOKEN_TRANSITION_MS } from '../core/constants.js'

// ─── Helpers ────────────────────────────────────────────────────────

let container: HTMLDivElement
let root: Root

function renderTrigger(props: {
  onOpen?: () => void
  onClose?: () => void
  drawerOpen?: boolean
  instanceId?: string
}) {
  const merged = {
    onOpen: props.onOpen ?? vi.fn(),
    onClose: props.onClose ?? vi.fn(),
    drawerOpen: props.drawerOpen ?? false,
    instanceId: props.instanceId,
  }
  act(() => {
    root.render(createElement(PreviewTrigger, merged))
  })
  return container.querySelector('button')!
}

beforeEach(() => {
  // Stub matchMedia for the useSyncExternalStore reduced-motion hook.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Stub innerHeight for clampY calculations.
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 800,
  })

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  document.body.removeChild(container)
  localStorage.clear()
})

// ─── Source file path ──────────────────────────────────────────────

// Vitest + ESM: __dirname is not available; compute it from import.meta.url.
const thisDir = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

const SOURCE_PATH = resolve(thisDir, 'PreviewTrigger.tsx')
const src = readFileSync(SOURCE_PATH, 'utf-8')

// ─── Transition constant checks (source audit) ─────────────────────

describe('PreviewTrigger transition constants (source audit)', () => {
  it('imports TRANSITION_MS from the constants module', () => {
    // The component should use the shared constant, not a hardcoded value.
    expect(src).toMatch(/import\s*\{[^}]*TRANSITION_MS[^}]*\}\s*from\s*['"]\.\.\/core\/constants/)
  })

  it('no longer uses hardcoded "0.2s" in the main transition string', () => {
    // After the refactor, the button transition uses `${TRANSITION_MS}ms ease`
    // template literals instead of the old "0.2s ease" string.
    //
    // The main transitionValue (width, background-color, box-shadow, opacity)
    // should reference TRANSITION_MS. We check the template literal pattern.
    expect(src).toContain('${TRANSITION_MS}ms ease')
  })

  it('exported constants have the expected millisecond values', () => {
    expect(TRANSITION_MS).toBe(200)
    expect(TOKEN_TRANSITION_MS).toBe(180)
  })

  it('TRANSITION_MS converts correctly to the legacy 0.2s value', () => {
    // Validates that TRANSITION_MS (200) is equivalent to the old "0.2s".
    expect(TRANSITION_MS / 1000).toBe(0.2)
  })
})

// ─── Keyboard activation (click without drag) ──────────────────────

describe('PreviewTrigger keyboard activation', () => {
  it('calls onOpen when clicked while drawer is closed', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const button = renderTrigger({ onOpen, onClose, drawerOpen: false })

    // A keyboard Enter/Space press dispatches a "click" event on the button.
    act(() => {
      button.click()
    })

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when clicked while drawer is open', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const button = renderTrigger({ onOpen, onClose, drawerOpen: true })

    act(() => {
      button.click()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('toggles correctly across re-renders with changing drawerOpen', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()

    // First click: drawer closed -> calls onOpen
    let button = renderTrigger({ onOpen, onClose, drawerOpen: false })
    act(() => { button.click() })
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(0)

    // Re-render with drawer now open -> calls onClose
    button = renderTrigger({ onOpen, onClose, drawerOpen: true })
    act(() => { button.click() })
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('works with multiple rapid clicks', () => {
    const onOpen = vi.fn()
    const button = renderTrigger({ onOpen, drawerOpen: false })

    act(() => {
      button.click()
      button.click()
      button.click()
    })

    expect(onOpen).toHaveBeenCalledTimes(3)
  })
})

// ─── Drag guard (source-level verification) ─────────────────────────

describe('PreviewTrigger drag guard', () => {
  it('has a dragJustFinishedRef that suppresses click after drag', () => {
    // The handleClick callback checks dragJustFinishedRef.current.
    // When true, it resets the ref and returns without calling onOpen/onClose.
    expect(src).toContain('dragJustFinishedRef.current')
    expect(src).toContain('dragJustFinishedRef.current = false')
  })

  it('sets dragJustFinishedRef to true in handlePointerUp when moved', () => {
    // After a drag (state.moved === true), pointerUp sets the flag so the
    // subsequent click event is suppressed.
    expect(src).toContain('dragJustFinishedRef.current = true')
  })

  it('uses DRAG_THRESHOLD of 4px for the move detection', () => {
    // The pointermove handler only activates drag mode when the pointer
    // moves >= DRAG_THRESHOLD pixels from the start position.
    expect(src).toContain('DRAG_THRESHOLD = 4')
    expect(src).toContain('Math.abs(dy) < DRAG_THRESHOLD')
  })

  it('handleClick early-returns when dragJustFinishedRef is true', () => {
    // Verify the guard pattern exists in the source: check, reset, return.
    const handleClickBlock = src.slice(
      src.indexOf('const handleClick'),
      src.indexOf('}, [drawerOpen, onOpen, onClose])')
    )
    expect(handleClickBlock).toContain('if (dragJustFinishedRef.current)')
    expect(handleClickBlock).toContain('dragJustFinishedRef.current = false')
    expect(handleClickBlock).toContain('return')
  })
})

// ─── Aria label ─────────────────────────────────────────────────────

describe('PreviewTrigger aria-label', () => {
  it('shows "Open style preview" when drawer is closed', () => {
    const button = renderTrigger({ drawerOpen: false })
    expect(button.getAttribute('aria-label')).toBe('Open style preview')
  })

  it('shows "Close style preview" when drawer is open', () => {
    const button = renderTrigger({ drawerOpen: true })
    expect(button.getAttribute('aria-label')).toBe('Close style preview')
  })
})

// ─── onClick is wired to the button element ─────────────────────────

describe('PreviewTrigger onClick wiring', () => {
  it('has onClick={handleClick} on the button element', () => {
    // The button must have an onClick so keyboard Enter/Space fires the
    // toggle logic (not just pointer events).
    expect(src).toContain('onClick={handleClick}')
  })

  it('does not toggle via onPointerUp for non-drag taps', () => {
    // After the refactor, handlePointerUp no longer calls onOpen/onClose
    // for non-drag taps. It falls through to the onClick handler instead.
    // Verify by checking that the pointerUp handler's dependency array
    // no longer includes onOpen/onClose.
    const pointerUpBlock = src.slice(
      src.indexOf('const handlePointerUp'),
      src.indexOf('const handlePointerCancel')
    )
    expect(pointerUpBlock).not.toContain('onOpen()')
    expect(pointerUpBlock).not.toContain('onClose()')
    // The dependency array should only have [key], not [drawerOpen, onOpen, onClose, key].
    expect(pointerUpBlock).toContain('[key]')
  })
})
