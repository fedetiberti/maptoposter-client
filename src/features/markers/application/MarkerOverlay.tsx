import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { iconRegistry } from '@/features/markers/infrastructure/IconRegistry'
import type { MapEngine } from '@/features/map/infrastructure/MapEngine'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'

/**
 * Mounts a MapLibre Marker per state entry, makes them draggable, and
 * dispatches UPDATE_MARKER on dragend. Pure side-effects component.
 */
export function MarkerOverlay({ engine }: { engine: MapEngine | null }) {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const marksRef = useRef<Map<string, maplibregl.Marker>>(new Map())

  useEffect(() => {
    if (!engine) return
    const map = engine.getMap()
    const live = marksRef.current
    const stateIds = new Set(state.markers.map((m) => m.id))

    // Remove markers that are no longer in state.
    for (const [id, marker] of live) {
      if (!stateIds.has(id)) {
        marker.remove()
        live.delete(id)
      }
    }

    // Add or update markers from state.
    for (const m of state.markers) {
      let marker = live.get(m.id)
      const icon = iconRegistry.find(m.iconId) ?? iconRegistry.list()[0]
      if (!icon) continue

      const el = document.createElement('div')
      el.style.width = `${m.sizePx}px`
      el.style.height = `${m.sizePx}px`
      el.style.cursor = 'grab'
      el.style.color = m.color
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
      el.innerHTML = icon.svg
      const svgEl = el.firstElementChild as SVGElement | null
      if (svgEl) {
        svgEl.setAttribute('width', `${m.sizePx}`)
        svgEl.setAttribute('height', `${m.sizePx}`)
        svgEl.style.color = m.color
      }

      if (!marker) {
        marker = new maplibregl.Marker({
          element: el,
          draggable: true,
          anchor: 'bottom',
        })
          .setLngLat([m.lon, m.lat])
          .addTo(map)
        marker.on('dragend', () => {
          const ll = marker!.getLngLat()
          dispatch({
            type: 'UPDATE_MARKER',
            id: m.id,
            patch: { lat: ll.lat, lon: ll.lng },
          })
        })
        live.set(m.id, marker)
      } else {
        marker.getElement().replaceChildren(...Array.from(el.childNodes))
        marker.getElement().style.width = el.style.width
        marker.getElement().style.height = el.style.height
        marker.getElement().style.color = m.color
        marker.setLngLat([m.lon, m.lat])
      }
    }

    return () => {
      // Don't tear down on every state change; only on engine change.
    }
  }, [engine, state.markers, dispatch])

  // Final cleanup when engine changes.
  useEffect(() => {
    return () => {
      for (const marker of marksRef.current.values()) marker.remove()
      marksRef.current.clear()
    }
  }, [engine])

  return null
}
