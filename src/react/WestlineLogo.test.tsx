// @vitest-environment jsdom

declare const globalThis: { IS_REACT_ACT_ENVIRONMENT: boolean }
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createElement, act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { WestlineLogo } from './WestlineLogo.js'

let container: HTMLDivElement
let root: Root

function renderLogo(props: { isDark?: boolean; height?: number | string } = {}) {
  act(() => {
    root.render(createElement(WestlineLogo, props))
  })

  return container.querySelector('img')!
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  document.body.removeChild(container)
})

describe('WestlineLogo', () => {
  it('switches SVG variants when the background mode changes', () => {
    const darkBg = renderLogo({ isDark: true })
    const darkSrc = darkBg.getAttribute('src')

    const lightBg = renderLogo({ isDark: false })
    const lightSrc = lightBg.getAttribute('src')

    expect(darkSrc).toContain('data:image/svg+xml;base64,')
    expect(lightSrc).toContain('data:image/svg+xml;base64,')
    expect(darkSrc).not.toBe(lightSrc)
  })

  it('renders as a decorative image', () => {
    const img = renderLogo()
    expect(img.getAttribute('alt')).toBe('')
    expect(img.getAttribute('aria-hidden')).toBe('true')
  })

  it('applies numeric heights in pixels', () => {
    const img = renderLogo({ height: 24 })
    expect(img.style.height).toBe('24px')
  })
})
