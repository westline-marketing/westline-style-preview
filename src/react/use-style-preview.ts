'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PreviewConfig } from '../types/index.js'
import { collectAllVarKeys, applyPreset, clearPreset } from '../core/apply-theme.js'
import { findPreset, validatePreset } from '../core/validate.js'
import { getPrepaintStyleId } from '../core/namespace.js'
import {
  getStoredPresetId,
  storePresetId,
  clearStoredPreset,
  getPresetIdFromUrl,
  buildPreviewUrl,
  clearUrlParam,
} from '../core/persistence.js'

export interface UseStylePreviewReturn {
  activePresetId: string
  targetFound: boolean
  setPreset: (id: string) => void
  resetPreset: () => void
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  previewUrl: string
}

interface UseStylePreviewOptions {
  enabled?: boolean
}

export function useStylePreview(
  config: PreviewConfig,
  options: UseStylePreviewOptions = {}
): UseStylePreviewReturn {
  const enabled = options.enabled ?? true
  const [activePresetId, setActivePresetId] = useState(config.defaultStyleId)
  const [targetFound, setTargetFound] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const allVarKeys = useMemo(() => collectAllVarKeys(config.presets), [config.presets])

  // Resolve initial preset from URL param > sessionStorage > default
  useEffect(() => {
    if (!enabled) {
      setActivePresetId(config.defaultStyleId)
      return
    }

    const urlId = getPresetIdFromUrl(config.queryParam)
    if (urlId && findPreset(urlId, config.presets)) {
      storePresetId(urlId, config)
      setActivePresetId(urlId)
    } else {
      const storedId = getStoredPresetId(config)
      if (storedId && findPreset(storedId, config.presets)) {
        setActivePresetId(storedId)
      }
    }

    // Dev-mode validation: warn about any presets with disallowed tokens
    if (process.env.NODE_ENV !== 'production') {
      for (const preset of config.presets) {
        if (!validatePreset(preset, config.allowedTokens)) {
          console.warn(
            `[style-preview] Preset "${preset.id}" fails validation against allowedTokens.`,
            preset
          )
        }
      }
    }
  }, [enabled, config.presets, config.queryParam, config.storageKey, config.instanceId, config.defaultStyleId, config.allowedTokens])

  // Apply theme whenever activePresetId changes
  useEffect(() => {
    if (!enabled) {
      setTargetFound(false)
      setIsDrawerOpen(false)
      return
    }

    const el = document.querySelector(config.targetSelector) as HTMLElement | null
    if (!el) {
      setTargetFound(false)
      return
    }
    setTargetFound(true)

    const preset = findPreset(activePresetId, config.presets)
    if (!preset || activePresetId === config.defaultStyleId) {
      clearPreset(el, allVarKeys)
      // Remove prepaint style if it exists
      const prepaintId = getPrepaintStyleId(config)
      document.getElementById(prepaintId)?.remove()
    } else {
      applyPreset(el, preset, allVarKeys, config.allowedTokens)
    }
  }, [enabled, activePresetId, config.presets, config.targetSelector, config.defaultStyleId, allVarKeys, config.storageKey, config.instanceId, config.allowedTokens])

  const setPreset = useCallback(
    (id: string) => {
      if (!enabled) return
      const preset = findPreset(id, config.presets)
      if (!preset) return
      storePresetId(id, config)
      setActivePresetId(id)
    },
    [enabled, config.presets, config.storageKey, config.instanceId]
  )

  const resetPreset = useCallback(() => {
    if (!enabled) return
    clearStoredPreset(config)
    clearUrlParam(config.queryParam)
    setActivePresetId(config.defaultStyleId)
  }, [enabled, config.storageKey, config.instanceId, config.queryParam, config.defaultStyleId])

  const openDrawer = useCallback(() => {
    if (!enabled) return
    setIsDrawerOpen(true)
  }, [enabled])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const previewUrl = useMemo(
    () => buildPreviewUrl(activePresetId, config.defaultStyleId, config.queryParam),
    [activePresetId, config.defaultStyleId, config.queryParam]
  )

  return {
    activePresetId,
    targetFound,
    setPreset,
    resetPreset,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    previewUrl,
  }
}
