import { describe, it, expect } from 'vitest'
import {
  resolveStorageNamespace,
  resolveLegacyStorageKey,
  getPrepaintStyleId,
} from './namespace.js'
import { DEFAULT_STORAGE_KEY, PREPAINT_STYLE_ID } from './constants.js'

describe('namespace', () => {
  describe('resolveStorageNamespace', () => {
    it('returns DEFAULT_STORAGE_KEY when called with no options', () => {
      expect(resolveStorageNamespace()).toBe(DEFAULT_STORAGE_KEY)
    })

    it('returns DEFAULT_STORAGE_KEY when called with an empty object', () => {
      expect(resolveStorageNamespace({})).toBe(DEFAULT_STORAGE_KEY)
    })

    it('returns instanceId when only instanceId is set', () => {
      expect(resolveStorageNamespace({ instanceId: 'my-id' })).toBe('my-id')
    })

    it('returns storageKey when only storageKey is set', () => {
      expect(resolveStorageNamespace({ storageKey: 'my-storage' })).toBe(
        'my-storage'
      )
    })

    it('returns instanceId when both are set (instanceId has priority)', () => {
      expect(
        resolveStorageNamespace({
          instanceId: 'my-id',
          storageKey: 'my-storage',
        })
      ).toBe('my-id')
    })

    it('preserves empty string if passed (?? does not treat "" as nullish)', () => {
      // Documents the current behavior: passing an empty string is an explicit
      // (though unusual) namespace. It does NOT fall through to the next option.
      expect(resolveStorageNamespace({ instanceId: '' })).toBe('')
    })
  })

  describe('resolveLegacyStorageKey', () => {
    it('returns null when no options provided', () => {
      expect(resolveLegacyStorageKey()).toBeNull()
    })

    it('returns null when only instanceId is set', () => {
      expect(resolveLegacyStorageKey({ instanceId: 'my-id' })).toBeNull()
    })

    it('returns null when only storageKey is set', () => {
      expect(resolveLegacyStorageKey({ storageKey: 'my-storage' })).toBeNull()
    })

    it('returns null when instanceId === storageKey (no migration needed)', () => {
      expect(
        resolveLegacyStorageKey({
          instanceId: 'same-value',
          storageKey: 'same-value',
        })
      ).toBeNull()
    })

    it('returns storageKey when instanceId differs (legacy migration case)', () => {
      expect(
        resolveLegacyStorageKey({
          instanceId: 'new-id',
          storageKey: 'old-storage',
        })
      ).toBe('old-storage')
    })
  })

  describe('getPrepaintStyleId', () => {
    it('returns PREPAINT_STYLE_ID + "-" + DEFAULT_STORAGE_KEY for empty options', () => {
      expect(getPrepaintStyleId()).toBe(`${PREPAINT_STYLE_ID}-${DEFAULT_STORAGE_KEY}`)
    })

    it('reflects instanceId when set', () => {
      expect(getPrepaintStyleId({ instanceId: 'my-id' })).toBe(
        `${PREPAINT_STYLE_ID}-my-id`
      )
    })

    it('reflects storageKey when only storageKey is set', () => {
      expect(getPrepaintStyleId({ storageKey: 'my-storage' })).toBe(
        `${PREPAINT_STYLE_ID}-my-storage`
      )
    })

    it('prefers instanceId over storageKey when both are set', () => {
      expect(
        getPrepaintStyleId({
          instanceId: 'my-id',
          storageKey: 'my-storage',
        })
      ).toBe(`${PREPAINT_STYLE_ID}-my-id`)
    })
  })
})
