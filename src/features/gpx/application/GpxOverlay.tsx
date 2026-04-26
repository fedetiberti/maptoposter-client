import { useEffect } from 'react'
import type { MapEngine } from '@/features/map/infrastructure/MapEngine'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { usePosterState } from '@/features/poster/application/PosterContext'

const SOURCE_ID = 'gpx-source'
const LAYER_ID = 'gpx-layer'

/**
 * Adds a geojson source + line layer for the imported GPX track.
 * Re-applied whenever the style is rebuilt (via styledata event).
 */
export function GpxOverlay({ engine }: { engine: MapEngine | null }) {
  const { gpx, theme: themeSel } = usePosterState()
  const fallback = THEMES[0]

  useEffect(() => {
    if (!engine || !fallback) return
    const map = engine.getMap()

    const apply = () => {
      // Remove old layer/source if present.
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID)
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
      if (!gpx) return

      const theme = findTheme(themeSel.id) ?? fallback
      const colors = resolveTheme(theme, themeSel.overrides)
      const color = gpx.color ?? colors['ui.text']

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'Feature', geometry: gpx.geoJson, properties: {} },
      })
      map.addLayer({
        id: LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': color,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 1.5,
            14, 3,
            18, 6,
          ],
          'line-opacity': 0.95,
        },
      })
    }

    apply()
    map.on('styledata', apply)
    return () => {
      map.off('styledata', apply)
    }
  }, [engine, gpx, themeSel.id, themeSel.overrides, fallback])

  return null
}
