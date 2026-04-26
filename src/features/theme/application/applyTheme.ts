import { useEffect } from 'react'
import type { MapEngine } from '@/features/map/infrastructure/MapEngine'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { buildMapStyle } from '@/features/theme/application/mapStyleSpec'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { services } from '@/core/services'

const FALLBACK_THEME = THEMES[0]

/** Imperative apply (used at mount time and in exports). */
export function applyThemeToEngine(engine: MapEngine): void {
  // No-op: kept for symmetry with future imperative needs (e.g. exports).
  void engine
}

/** Watches reducer state and pushes style updates into the live MapLibre map. */
export function useApplyThemeEffect(engine: MapEngine | null): void {
  const { theme: themeSel, layers } = usePosterState()

  useEffect(() => {
    if (!engine) return
    if (!FALLBACK_THEME) return
    const theme = findTheme(themeSel.id) ?? FALLBACK_THEME
    const colors = resolveTheme(theme, themeSel.overrides)
    const spec = buildMapStyle({
      colors,
      layers,
      tilesBaseUrl: services.config.tilesBaseUrl,
    })
    engine.setStyle(spec, { diff: true })
  }, [engine, themeSel.id, themeSel.overrides, layers])
}
