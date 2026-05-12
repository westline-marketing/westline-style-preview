import type { PreviewConfig } from '../types/index.js'
import { generatePrepaintScript } from '../core/prepaint.js'

interface PrepaintScriptProps {
  config: PreviewConfig
  /**
   * Whether the style selector is enabled. When omitted, falls back to
   * checking `process.env.NEXT_PUBLIC_ENABLE_STYLE_SELECTOR === 'true'`
   * so Next.js consumers can gate via env vars. Non-Next consumers should
   * pass this explicitly.
   */
  enabled?: boolean
}

export function PrepaintScript({ config, enabled }: PrepaintScriptProps) {
  const isEnabled = enabled ?? process.env.NEXT_PUBLIC_ENABLE_STYLE_SELECTOR === 'true'
  if (!isEnabled) return null

  const script = generatePrepaintScript(config)
  if (!script) return null

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  )
}
