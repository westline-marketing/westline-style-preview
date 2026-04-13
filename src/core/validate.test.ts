import { describe, it, expect } from 'vitest'
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
})
