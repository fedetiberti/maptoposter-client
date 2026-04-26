import { useEffect, useRef } from 'react'
import { MapEngine } from '@/features/map/infrastructure/MapEngine'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { services } from '@/core/services'

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<MapEngine | null>(null)
  const state = usePosterState()
  const dispatch = usePosterDispatch()

  // Mount once.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const engine = new MapEngine({
      container: el,
      styleUrl: `${services.config.tilesBaseUrl}/styles/positron`,
      view: state.view,
      onCameraChange: (view) => dispatch({ type: 'SET_VIEW', view }),
    })
    engineRef.current = engine
    return () => {
      engine.destroy()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to programmatic view changes.
  useEffect(() => {
    engineRef.current?.setView(state.view)
  }, [state.view])

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />
}
