'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { PreviewConfig } from '../types/index.js'
import { resolveDrawerTheme, parsePreviewDrawerParam } from '../themes/index.js'
import { deriveDrawerTheme } from '../themes/derive.js'
import { useStylePreview } from './use-style-preview.js'
import { PreviewTrigger } from './PreviewTrigger.js'
import { PreviewDrawer } from './PreviewDrawer.js'

// Hydration-safe "are we in the browser?" signal without setState-in-effect.
const emptySubscribe = () => () => {}
const returnTrue = () => true
const returnFalse = () => false

interface StylePreviewProps {
  config: PreviewConfig
  /**
   * Whether the preview feature is enabled. When omitted, falls back to
   * checking `process.env.NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true'`
   * so Next.js consumers can gate via env vars. Non-Next consumers should
   * pass this explicitly.
   */
  enabled?: boolean
}

export function StylePreview({ config, enabled }: StylePreviewProps) {
  const isEnabled = enabled ?? process.env.NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true'
  const mounted = useSyncExternalStore(emptySubscribe, returnTrue, returnFalse)

  // Dev-mode: allow ?previewDrawer=techie|studio|rustic to override theme
  const themeConfig = useMemo((): PreviewConfig => {
    if (process.env.NODE_ENV === 'production') return config
    if (typeof window === 'undefined') return config
    const params = new URLSearchParams(window.location.search)
    const override = parsePreviewDrawerParam(params.get('previewDrawer'))
    if (!override) return config
    return { ...config, drawerTheme: override }
  }, [config])

  const {
    activePresetId,
    targetFound,
    setPreset,
    resetPreset,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    previewUrl,
  } = useStylePreview(config, { enabled: isEnabled })

  const baseTheme = useMemo(() => resolveDrawerTheme(themeConfig), [themeConfig])
  const isThemeLocked = Boolean(
    themeConfig.uiTheme || (themeConfig.drawerTheme && themeConfig.drawerTheme !== 'auto')
  )
  const theme = useMemo(() => {
    if (isThemeLocked) return baseTheme
    const activePreset = config.presets.find((p) => p.id === activePresetId)
    // Default preset = "no style change" → drawer returns to base chrome.
    // Only non-default presets trigger swatch-driven derivation.
    if (!activePreset || activePresetId === config.defaultStyleId) return baseTheme
    return deriveDrawerTheme(activePreset.swatches, baseTheme) ?? baseTheme
  }, [activePresetId, config.presets, config.defaultStyleId, baseTheme, isThemeLocked])

  if (!isEnabled) return null
  if (!mounted || !targetFound) return null

  return createPortal(
    <>
      <PreviewTrigger
        onOpen={openDrawer}
        onClose={closeDrawer}
        drawerOpen={isDrawerOpen}
        instanceId={config.instanceId ?? config.storageKey}
      />
      <PreviewDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        presets={config.presets}
        activePresetId={activePresetId}
        onSelectPreset={setPreset}
        onReset={resetPreset}
        previewUrl={previewUrl}
        theme={theme}
      />
    </>,
    document.body
  )
}
