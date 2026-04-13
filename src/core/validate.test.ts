import { describe, it, expect, vi, afterEach } from 'vitest'
import { findPreset, validatePreset } from './validate.js'
import type { StylePreset } from '../types/index.js'

describe('validate', () => {
  describe('findPreset', () => {
    it('returns the preset when the id matches', () => {
      const preset: StylePreset = {
        id: 'dark',
        label: 'Dark Mode',
        variables: { '--bg': '#000' },
      }
      expect(findPreset('dark', [preset])).toBe(preset)
    })

    it('returns undefined when the id does not match any preset', () => {
      const preset: StylePreset = {
        id: 'dark',
        label: 'Dark Mode',
        variables: { '--bg': '#000' },
      }
      expect(findPreset('light', [preset])).toBeUndefined()
    })

    it('returns undefined for an empty preset array', () => {
      expect(findPreset('dark', [])).toBeUndefined()
    })

    it('is case-sensitive', () => {
      const preset: StylePreset = {
        id: 'Dark',
        label: 'Dark Mode',
        variables: { '--bg': '#000' },
      }
      expect(findPreset('dark', [preset])).toBeUndefined()
    })
  })

  describe('validatePreset', () => {
    it('returns true for a preset with empty variables and no allowlist', () => {
      const preset: StylePreset = {
        id: 'test',
        label: 'Test',
        variables: {},
      }
      expect(validatePreset(preset)).toBe(true)
    })

    it('returns true for a preset whose variables are all in the allowlist', () => {
      const preset: StylePreset = {
        id: 'test',
        label: 'Test',
        variables: { '--color-1': '#fff', '--color-2': '#000' },
      }
      expect(validatePreset(preset, ['--color-1', '--color-2'])).toBe(true)
    })

    it('returns false for a preset with a variable NOT in the allowlist', () => {
      const preset: StylePreset = {
        id: 'test',
        label: 'Test',
        variables: { '--color-1': '#fff', '--color-3': '#ccc' },
      }
      expect(validatePreset(preset, ['--color-1'])).toBe(false)
    })

    it('returns true when allowedTokens is undefined (no restriction)', () => {
      const preset: StylePreset = {
        id: 'test',
        label: 'Test',
        variables: { '--color-1': '#fff', '--color-2': '#000' },
      }
      expect(validatePreset(preset, undefined)).toBe(true)
    })

    it('returns true for an empty allowlist combined with empty variables', () => {
      const preset: StylePreset = {
        id: 'test',
        label: 'Test',
        variables: {},
      }
      expect(validatePreset(preset, [])).toBe(true)
    })

    it('returns false for variables when allowlist is empty but variables exist', () => {
      const preset: StylePreset = {
        id: 'test',
        label: 'Test',
        variables: { '--color-1': '#fff' },
      }
      expect(validatePreset(preset, [])).toBe(false)
    })

    it('returns false when id is empty', () => {
      const preset: StylePreset = {
        id: '',
        label: 'Test',
        variables: {},
      }
      expect(validatePreset(preset)).toBe(false)
    })

    it('returns false when label is empty', () => {
      const preset: StylePreset = {
        id: 'test',
        label: '',
        variables: {},
      }
      expect(validatePreset(preset)).toBe(false)
    })

    it('returns false when variables is null', () => {
      const preset = {
        id: 'test',
        label: 'Test',
        variables: null,
      } as unknown as StylePreset
      expect(validatePreset(preset)).toBe(false)
    })
  })

  describe('swatches validation', () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
      vi.restoreAllMocks()
    })

    it('passes without warning when preset has 5 swatches', () => {
      process.env.NODE_ENV = 'development'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'warm',
        label: 'Warm',
        variables: { '--bg': '#FFF5E6' },
        swatches: ['#FFF5E6', '#F5E6D3', '#1C1917', '#D97706', '#E7E5E4'],
      }
      expect(validatePreset(preset)).toBe(true)
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('passes but warns when non-default preset has fewer than 5 swatches', () => {
      process.env.NODE_ENV = 'development'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'partial',
        label: 'Partial',
        variables: { '--bg': '#FFF5E6' },
        swatches: ['#FFF5E6', '#F5E6D3', '#1C1917'],
      }
      expect(validatePreset(preset)).toBe(true)
      expect(warnSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledWith(
        '[style-preview] Preset "partial" has 3 swatches (5 required for auto drawer theming)'
      )
    })

    it('passes but warns when non-default preset has no swatches', () => {
      process.env.NODE_ENV = 'development'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'missing',
        label: 'Missing',
        variables: { '--bg': '#FFF5E6' },
      }
      expect(validatePreset(preset)).toBe(true)
      expect(warnSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledWith(
        '[style-preview] Preset "missing" has 0 swatches (5 required for auto drawer theming)'
      )
    })

    it('passes without warning for default preset (empty variables) with no swatches', () => {
      process.env.NODE_ENV = 'development'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'default',
        label: 'Default',
        variables: {},
      }
      expect(validatePreset(preset)).toBe(true)
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('warns for a preset with empty variables when it is not the defaultStyleId', () => {
      process.env.NODE_ENV = 'development'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'swatch-only',
        label: 'Swatch Only',
        variables: {},
      }
      expect(validatePreset(preset, undefined, 'original')).toBe(true)
      expect(warnSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledWith(
        '[style-preview] Preset "swatch-only" has 0 swatches (5 required for auto drawer theming)'
      )
    })

    it('does not warn for default preset identified by defaultStyleId even with empty variables', () => {
      process.env.NODE_ENV = 'development'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'original',
        label: 'Original',
        variables: {},
      }
      expect(validatePreset(preset, undefined, 'original')).toBe(true)
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('does not warn in production even when swatches are missing', () => {
      process.env.NODE_ENV = 'production'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const preset: StylePreset = {
        id: 'prod',
        label: 'Prod',
        variables: { '--bg': '#FFF5E6' },
      }
      expect(validatePreset(preset)).toBe(true)
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })
})
