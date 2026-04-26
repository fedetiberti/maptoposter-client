import { useEffect, useRef, useState } from 'react'
import { MapEngine } from '@/features/map/infrastructure/MapEngine'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { useApplyThemeEffect } from '@/features/theme/application/applyTheme'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { buildMapStyle } from '@/features/theme/application/mapStyleSpec'
import { services } from '@/core/services'
import { MarkerOverlay } from '@/features/markers/application/MarkerOverlay'

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<MapEngine | null>(null)
  const [engine, setEngine] = useState<MapEngine | null>(null)
  const state = usePosterState()
  const dispatch = usePosterDispatch()

  // Mount once with initial style derived from current state.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const fallback = THEMES[0]
    if (!fallback) return
    const theme = findTheme(state.theme.id) ?? fallback
    const colors = resolveTheme(theme, state.theme.overrides)
    const initialStyle = buildMapStyle({
      colors,
      layers: state.layers,
      tilesBaseUrl: services.config.tilesBaseUrl,
    })
    const e = new MapEngine({
      container: el,
      initialStyle,
      view: state.view,
      onCameraChange: (view) => dispatch({ type: 'SET_VIEW', view }),
    })
    engineRef.current = e
    setEngine(e)
    return () => {
      e.destroy()
      engineRef.current = null
      setEngine(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useApplyThemeEffect(engine)

  // React to programmatic view changes.
  useEffect(() => {
    engineRef.current?.setView(state.view)
  }, [state.view])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <MarkerOverlay engine={engine} />
    </>
  )
}
