import { describe, it, expect, afterEach, vi } from 'vitest'
import type { ReactElement } from 'react'
import { PrepaintScript } from './PrepaintScript.js'
import type { PreviewConfig } from '../types/index.js'

const validConfig: PreviewConfig = {
  defaultStyleId: 'default',
  targetSelector: '.theme',
  presets: [
    { id: 'default', label: 'Default', variables: {} },
    { id: 'alt', label: 'Alt', variables: { '--bg': '#fff' } },
  ],
}

const emptyPresetsConfig: PreviewConfig = {
  defaultStyleId: 'default',
  targetSelector: '.theme',
  presets: [{ id: 'default', label: 'Default', variables: {} }],
}

interface ScriptProps {
  dangerouslySetInnerHTML: { __html: string }
  suppressHydrationWarning: boolean
}

function assertScriptElement(value: unknown): asserts value is ReactElement<ScriptProps, 'script'> {
  if (value === null || value === undefined) {
    throw new Error('expected a React script element, got null/undefined')
  }
}

describe('PrepaintScript enabled prop', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns null when enabled={false}', () => {
    const result = PrepaintScript({ config: validConfig, enabled: false })
    expect(result).toBeNull()
  })

  it('returns a script element when enabled={true}', () => {
    const result = PrepaintScript({ config: validConfig, enabled: true })
    assertScriptElement(result)
    expect(result.type).toBe('script')
    expect(result.props.suppressHydrationWarning).toBe(true)
    expect(result.props.dangerouslySetInnerHTML.__html).toContain('sessionStorage')
    expect(result.props.dangerouslySetInnerHTML.__html.length).toBeGreaterThan(0)
  })

  it('respects enabled={false} even when env var is "true"', () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_STYLE_PREVIEW', 'true')
    const result = PrepaintScript({ config: validConfig, enabled: false })
    expect(result).toBeNull()
  })

  it('falls back to env when enabled is undefined and env is "true"', () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_STYLE_PREVIEW', 'true')
    const result = PrepaintScript({ config: validConfig })
    assertScriptElement(result)
    expect(result.type).toBe('script')
  })

  it('returns null when enabled is undefined and env is empty string', () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_STYLE_PREVIEW', '')
    const result = PrepaintScript({ config: validConfig })
    expect(result).toBeNull()
  })

  it('returns null when enabled={true} but all presets have empty variables', () => {
    const result = PrepaintScript({ config: emptyPresetsConfig, enabled: true })
    expect(result).toBeNull()
  })
})
