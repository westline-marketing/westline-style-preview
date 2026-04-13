// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest'
import {
  storePresetId,
  getStoredPresetId,
  clearStoredPreset,
  getPresetIdFromUrl,
  buildPreviewUrl,
  clearUrlParam,
} from './persistence.js'
import { DEFAULT_STORAGE_KEY } from './constants.js'

describe('persistence', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.history.replaceState({}, '', 'http://localhost/')
  })

  describe('storePresetId', () => {
    it('stores value under default storage key when no options given', () => {
      storePresetId('preset-1')
      expect(sessionStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('preset-1')
    })

    it('stores value under instanceId namespace when provided', () => {
      storePresetId('preset-2', { instanceId: 'app-1' })
      expect(sessionStorage.getItem('app-1')).toBe('preset-2')
      expect(sessionStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
    })

    it('stores value under storageKey namespace when only that is provided', () => {
      storePresetId('preset-3', { storageKey: 'custom-key' })
      expect(sessionStorage.getItem('custom-key')).toBe('preset-3')
      expect(sessionStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
    })

    it('prefers instanceId over storageKey when both are provided', () => {
      storePresetId('preset-4', { instanceId: 'app-2', storageKey: 'legacy-key' })
      expect(sessionStorage.getItem('app-2')).toBe('preset-4')
      expect(sessionStorage.getItem('legacy-key')).toBeNull()
    })

    it('overwrites previous value on multiple calls', () => {
      storePresetId('first', { storageKey: 'key-1' })
      expect(sessionStorage.getItem('key-1')).toBe('first')
      storePresetId('second', { storageKey: 'key-1' })
      expect(sessionStorage.getItem('key-1')).toBe('second')
    })
  })

  describe('getStoredPresetId', () => {
    it('returns null when storage is empty', () => {
      expect(getStoredPresetId()).toBeNull()
    })

    it('returns the stored value from the default namespace', () => {
      sessionStorage.setItem(DEFAULT_STORAGE_KEY, 'stored-preset')
      expect(getStoredPresetId()).toBe('stored-preset')
    })

    it('returns the stored value from an instanceId namespace', () => {
      sessionStorage.setItem('app-instance', 'app-preset')
      expect(getStoredPresetId({ instanceId: 'app-instance' })).toBe('app-preset')
    })

    it('returns the stored value from a storageKey namespace', () => {
      sessionStorage.setItem('custom-storage', 'custom-preset')
      expect(getStoredPresetId({ storageKey: 'custom-storage' })).toBe('custom-preset')
    })

    it('enforces namespace isolation', () => {
      sessionStorage.setItem('namespace-a', 'preset-a')
      sessionStorage.setItem('namespace-b', 'preset-b')
      expect(getStoredPresetId({ instanceId: 'namespace-a' })).toBe('preset-a')
      expect(getStoredPresetId({ instanceId: 'namespace-b' })).toBe('preset-b')
      expect(getStoredPresetId({ instanceId: 'namespace-c' })).toBeNull()
    })

    it('prefers instanceId over storageKey when both have entries', () => {
      sessionStorage.setItem('instance-ns', 'instance-value')
      sessionStorage.setItem('storage-ns', 'storage-value')
      expect(
        getStoredPresetId({ instanceId: 'instance-ns', storageKey: 'storage-ns' })
      ).toBe('instance-value')
    })
  })

  describe('getStoredPresetId — legacy migration', () => {
    it('migrates legacy value when new namespace is empty and legacy exists', () => {
      sessionStorage.setItem('legacy-key', 'legacy-preset')

      const result = getStoredPresetId({
        instanceId: 'new-namespace',
        storageKey: 'legacy-key',
      })

      expect(result).toBe('legacy-preset')
      expect(sessionStorage.getItem('new-namespace')).toBe('legacy-preset')
      expect(sessionStorage.getItem('legacy-key')).toBeNull()
    })

    it('does not migrate when new namespace already has an entry', () => {
      sessionStorage.setItem('new-namespace', 'new-preset')
      sessionStorage.setItem('legacy-key', 'legacy-preset')

      const result = getStoredPresetId({
        instanceId: 'new-namespace',
        storageKey: 'legacy-key',
      })

      expect(result).toBe('new-preset')
      expect(sessionStorage.getItem('legacy-key')).toBe('legacy-preset')
    })

    it('does not migrate when instanceId and storageKey are identical', () => {
      sessionStorage.setItem('same-key', 'some-preset')

      const result = getStoredPresetId({
        instanceId: 'same-key',
        storageKey: 'same-key',
      })

      expect(result).toBe('some-preset')
      expect(sessionStorage.getItem('same-key')).toBe('some-preset')
    })

    it('does not migrate when only instanceId is set', () => {
      sessionStorage.setItem('instance-only', 'instance-preset')

      const result = getStoredPresetId({ instanceId: 'instance-only' })

      expect(result).toBe('instance-preset')
      expect(sessionStorage.getItem('instance-only')).toBe('instance-preset')
    })

    it('returns null when neither namespace has an entry', () => {
      const result = getStoredPresetId({
        instanceId: 'empty-namespace',
        storageKey: 'also-empty',
      })
      expect(result).toBeNull()
    })
  })

  describe('clearStoredPreset', () => {
    it('removes the default namespace entry', () => {
      sessionStorage.setItem(DEFAULT_STORAGE_KEY, 'preset')
      clearStoredPreset()
      expect(sessionStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
    })

    it('removes an instanceId namespace entry', () => {
      sessionStorage.setItem('app-1', 'preset')
      clearStoredPreset({ instanceId: 'app-1' })
      expect(sessionStorage.getItem('app-1')).toBeNull()
    })

    it('removes a storageKey namespace entry', () => {
      sessionStorage.setItem('custom-key', 'preset')
      clearStoredPreset({ storageKey: 'custom-key' })
      expect(sessionStorage.getItem('custom-key')).toBeNull()
    })

    it('removes both new and legacy entries when legacy is configured', () => {
      sessionStorage.setItem('new-namespace', 'new-preset')
      sessionStorage.setItem('legacy-key', 'legacy-preset')

      clearStoredPreset({
        instanceId: 'new-namespace',
        storageKey: 'legacy-key',
      })

      expect(sessionStorage.getItem('new-namespace')).toBeNull()
      expect(sessionStorage.getItem('legacy-key')).toBeNull()
    })

    it('is a no-op when there is nothing to clear', () => {
      clearStoredPreset({ storageKey: 'nonexistent' })
      expect(sessionStorage.length).toBe(0)
    })

    it('only clears the specified namespace', () => {
      sessionStorage.setItem('app-1', 'preset-1')
      sessionStorage.setItem('app-2', 'preset-2')

      clearStoredPreset({ instanceId: 'app-1' })

      expect(sessionStorage.getItem('app-1')).toBeNull()
      expect(sessionStorage.getItem('app-2')).toBe('preset-2')
    })
  })

  describe('getPresetIdFromUrl', () => {
    it('returns null when URL has no preview query param', () => {
      window.history.replaceState({}, '', 'http://localhost/')
      expect(getPresetIdFromUrl()).toBeNull()
    })

    it('returns the value when URL has the default query param', () => {
      window.history.replaceState({}, '', 'http://localhost/?previewStyle=dark-mode')
      expect(getPresetIdFromUrl()).toBe('dark-mode')
    })

    it('returns the value with a custom query param name', () => {
      window.history.replaceState({}, '', 'http://localhost/?style=custom-preset')
      expect(getPresetIdFromUrl('style')).toBe('custom-preset')
    })

    it('returns null when the custom param is not present', () => {
      window.history.replaceState({}, '', 'http://localhost/?previewStyle=foo')
      expect(getPresetIdFromUrl('style')).toBeNull()
    })

    it('handles multiple query params', () => {
      window.history.replaceState(
        {},
        '',
        'http://localhost/?foo=bar&previewStyle=preset-1&baz=qux'
      )
      expect(getPresetIdFromUrl()).toBe('preset-1')
    })
  })

  describe('buildPreviewUrl', () => {
    it('sets the query param when presetId is non-default', () => {
      window.history.replaceState({}, '', 'http://localhost/')
      const url = buildPreviewUrl('dark-mode', 'light-mode')
      expect(url).toContain('previewStyle=dark-mode')
    })

    it('removes the query param when presetId equals defaultId', () => {
      window.history.replaceState({}, '', 'http://localhost/?previewStyle=dark-mode')
      const url = buildPreviewUrl('light-mode', 'light-mode')
      expect(url).not.toContain('previewStyle')
    })

    it('uses a custom query param name when provided', () => {
      window.history.replaceState({}, '', 'http://localhost/')
      const url = buildPreviewUrl('preset-1', 'default', 'style')
      expect(url).toContain('style=preset-1')
      expect(url).not.toContain('previewStyle')
    })

    it('preserves existing query params that are not the preview param', () => {
      window.history.replaceState({}, '', 'http://localhost/?foo=bar&baz=qux')
      const url = buildPreviewUrl('dark-mode', 'light-mode')
      expect(url).toContain('foo=bar')
      expect(url).toContain('baz=qux')
      expect(url).toContain('previewStyle=dark-mode')
    })

    it('replaces an existing preview param with the new value', () => {
      window.history.replaceState({}, '', 'http://localhost/?previewStyle=old-preset')
      const url = buildPreviewUrl('new-preset', 'light-mode')
      expect(url).toContain('previewStyle=new-preset')
      expect(url).not.toContain('old-preset')
    })
  })

  describe('clearUrlParam', () => {
    it('removes the query param from the URL', () => {
      window.history.replaceState({}, '', 'http://localhost/?previewStyle=dark-mode')
      clearUrlParam()
      expect(window.location.href).toBe('http://localhost/')
    })

    it('is a no-op when the param is not present', () => {
      window.history.replaceState({}, '', 'http://localhost/')
      clearUrlParam()
      expect(window.location.href).toBe('http://localhost/')
    })

    it('removes a custom param name when provided', () => {
      window.history.replaceState({}, '', 'http://localhost/?style=preset-1')
      clearUrlParam('style')
      expect(window.location.href).toBe('http://localhost/')
    })

    it('preserves other query params', () => {
      window.history.replaceState(
        {},
        '',
        'http://localhost/?foo=bar&previewStyle=dark-mode&baz=qux'
      )
      clearUrlParam()
      expect(window.location.href).toContain('foo=bar')
      expect(window.location.href).toContain('baz=qux')
      expect(window.location.href).not.toContain('previewStyle')
    })
  })
})
