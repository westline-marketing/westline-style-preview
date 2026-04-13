import { describe, it, expect } from 'vitest'
import { generatePrepaintScript } from './prepaint.js'
import type { PreviewConfig } from '../types/index.js'

function makeConfig(overrides: Partial<PreviewConfig> = {}): PreviewConfig {
  return {
    defaultStyleId: 'default',
    targetSelector: ':root',
    presets: [
      {
        id: 'light',
        label: 'Light',
        variables: { '--bg': '#fff', '--fg': '#000' },
      },
    ],
    ...overrides,
  }
}

describe('generatePrepaintScript', () => {
  describe('empty / no-op cases', () => {
    it('returns empty string when config.presets is empty', () => {
      expect(generatePrepaintScript(makeConfig({ presets: [] }))).toBe('')
    })

    it('returns empty string when all presets have empty variables objects', () => {
      const config = makeConfig({
        presets: [
          { id: 'p1', label: 'P1', variables: {} },
          { id: 'p2', label: 'P2', variables: {} },
        ],
      })
      expect(generatePrepaintScript(config)).toBe('')
    })

    it('returns empty string when all variables are filtered out by allowedTokens', () => {
      const config = makeConfig({
        presets: [
          { id: 'p1', label: 'P1', variables: { '--bg': 'red', '--fg': 'blue' } },
        ],
        allowedTokens: ['--nonexistent'],
      })
      expect(generatePrepaintScript(config)).toBe('')
    })
  })

  describe('basic correctness', () => {
    it('returns a non-empty string for a valid config', () => {
      const result = generatePrepaintScript(makeConfig())
      expect(result.length).toBeGreaterThan(0)
    })

    it('output is a self-invoking function', () => {
      const result = generatePrepaintScript(makeConfig())
      expect(result).toMatch(/^\(function\(\)\{/)
      expect(result).toMatch(/\}\)\(\);$/)
    })

    it('output contains sessionStorage.getItem and sessionStorage.setItem', () => {
      const result = generatePrepaintScript(makeConfig())
      expect(result).toContain('sessionStorage.getItem')
      expect(result).toContain('sessionStorage.setItem')
    })

    it('output contains document.createElement("style")', () => {
      const result = generatePrepaintScript(makeConfig())
      expect(result).toContain('document.createElement("style")')
    })

    it('output contains the expected prepaint style ID derived from instanceId', () => {
      const result = generatePrepaintScript(makeConfig({ instanceId: 'test-instance' }))
      expect(result).toContain('wm-prepaint-test-instance')
    })

    it('includes the targetSelector in the generated code', () => {
      const result = generatePrepaintScript(makeConfig({ targetSelector: '.my-custom-selector' }))
      expect(result).toContain('.my-custom-selector')
    })
  })

  describe('serialization safety', () => {
    it('targetSelector containing a double quote does not break out of its JSON literal', () => {
      const result = generatePrepaintScript(makeConfig({ targetSelector: '.theme"attack' }))
      // The raw literal `"attack` should never appear as an unescaped top-level identifier
      // because JSON.stringify escapes the inner quote as \"
      expect(result).toContain('\\"attack')
    })

    it('targetSelector containing </script> does not produce a literal </script> substring', () => {
      const result = generatePrepaintScript(makeConfig({ targetSelector: '</script>' }))
      expect(result.includes('</script>')).toBe(false)
    })

    it('targetSelector containing & is escaped as \\u0026', () => {
      const result = generatePrepaintScript(makeConfig({ targetSelector: 'a&b' }))
      // The user-supplied `a&b` must be escaped. We can't blanket-ban `&` from
      // the output because the generated script itself uses `&&` as a logical
      // operator. Instead, verify the raw `a&b` substring is absent and the
      // escaped form is present.
      expect(result).toContain('\\u0026')
      expect(result).not.toContain('a&b')
      expect(result).toContain('a\\u0026b')
    })

    it('preset variable value containing U+2028 is escaped as \\u2028', () => {
      const result = generatePrepaintScript(
        makeConfig({
          presets: [
            { id: 'p1', label: 'P1', variables: { '--sep': 'before\u2028after' } },
          ],
        })
      )
      expect(result).toContain('\\u2028')
      expect(result.includes('\u2028')).toBe(false)
    })

    it('preset variable value with semicolon in a data URI is preserved intact', () => {
      const dataUri = 'url("data:image/svg+xml;base64,abc")'
      const result = generatePrepaintScript(
        makeConfig({
          presets: [{ id: 'p1', label: 'P1', variables: { '--bg-image': dataUri } }],
        })
      )
      // JSON.stringify will escape the inner quotes, so verify the semicolon and 'base64'
      // stay together in the preset map (the new object-based format preserves values intact).
      expect(result).toContain('base64,abc')
      expect(result).toContain('image/svg+xml;base64')
    })

    it('preset variable value with < and > characters are escaped', () => {
      const result = generatePrepaintScript(
        makeConfig({
          presets: [{ id: 'p1', label: 'P1', variables: { '--content': '<span>' } }],
        })
      )
      expect(result.includes('<span>')).toBe(false)
      expect(result).toContain('\\u003C')
      expect(result).toContain('\\u003E')
    })
  })

  describe('legacy migration', () => {
    it('when instanceId and storageKey are both set and different, output contains both', () => {
      const result = generatePrepaintScript(
        makeConfig({ instanceId: 'instance-1', storageKey: 'legacy-key' })
      )
      expect(result).toContain('instance-1')
      expect(result).toContain('legacy-key')
    })

    it('when only instanceId is set, legacy key serializes as null', () => {
      const result = generatePrepaintScript(makeConfig({ instanceId: 'instance-only' }))
      expect(result).toContain('lk=null')
    })

    it('when only storageKey is set, legacy key is null (storageKey is primary)', () => {
      const result = generatePrepaintScript(makeConfig({ storageKey: 'storage-only' }))
      expect(result).toContain('lk=null')
    })

    it('when instanceId equals storageKey, legacy key is null', () => {
      const result = generatePrepaintScript(
        makeConfig({ instanceId: 'same', storageKey: 'same' })
      )
      expect(result).toContain('lk=null')
    })
  })

  describe('allowedTokens enforcement', () => {
    it('only allowed variables appear in the preset map', () => {
      const result = generatePrepaintScript(
        makeConfig({
          presets: [
            { id: 'p1', label: 'P1', variables: { '--bg': 'red', '--evil': 'x' } },
          ],
          allowedTokens: ['--bg'],
        })
      )
      expect(result).toContain('--bg')
      expect(result).not.toContain('--evil')
    })

    it('presets whose variables are all filtered out are omitted from the map', () => {
      const result = generatePrepaintScript(
        makeConfig({
          presets: [
            { id: 'kept', label: 'Kept', variables: { '--bg': 'red' } },
            { id: 'dropped', label: 'Dropped', variables: { '--evil': 'x' } },
          ],
          allowedTokens: ['--bg'],
        })
      )
      expect(result).toContain('kept')
      expect(result).not.toContain('dropped')
    })
  })

  describe('structural', () => {
    it('returned string does not contain unescaped newlines', () => {
      expect(generatePrepaintScript(makeConfig())).not.toContain('\n')
    })

    it('returned string ends with ();', () => {
      expect(generatePrepaintScript(makeConfig()).endsWith('();')).toBe(true)
    })

    it('generated script has all variables declared', () => {
      const result = generatePrepaintScript(
        makeConfig({ queryParam: 'myParam', targetSelector: '#target' })
      )
      expect(result).toContain('var m=')
      expect(result).toContain('var k=')
      expect(result).toContain('var lk=')
      expect(result).toContain('var q=')
      expect(result).toContain('var id=')
      expect(result).toContain('var s=')
    })
  })

  describe('query parameter handling', () => {
    it('uses custom queryParam when provided', () => {
      expect(
        generatePrepaintScript(makeConfig({ queryParam: 'customParam' }))
      ).toContain('customParam')
    })

    it('uses previewStyle default when queryParam is not provided', () => {
      expect(generatePrepaintScript(makeConfig())).toContain('previewStyle')
    })
  })

  describe('preset map correctness', () => {
    it('multiple presets appear in the preset map', () => {
      const result = generatePrepaintScript(
        makeConfig({
          presets: [
            { id: 'light', label: 'Light', variables: { '--bg': '#fff' } },
            { id: 'dark', label: 'Dark', variables: { '--bg': '#000' } },
          ],
        })
      )
      expect(result).toContain('"light"')
      expect(result).toContain('"dark"')
    })

    it('CSS variable names are preserved intact', () => {
      const result = generatePrepaintScript(
        makeConfig({
          presets: [
            {
              id: 'p1',
              label: 'P1',
              variables: {
                '--color-primary': '#0066ff',
                '--spacing-unit': '8px',
              },
            },
          ],
        })
      )
      expect(result).toContain('--color-primary')
      expect(result).toContain('--spacing-unit')
    })
  })
})
