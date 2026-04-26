import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapView } from '@/features/poster/domain/PosterState'

export interface MapEngineOptions {
  container: HTMLElement
  styleUrl: string
  view: MapView
  onCameraChange: (view: MapView) => void
}

export class MapEngine {
  private readonly map: maplibregl.Map
  private readonly onCameraChange: (view: MapView) => void
  private suppressCallback = false

  constructor(opts: MapEngineOptions) {
    this.onCameraChange = opts.onCameraChange
    this.map = new maplibregl.Map({
      container: opts.container,
      style: opts.styleUrl,
      center: [opts.view.lon, opts.view.lat],
      zoom: opts.view.zoom,
      bearing: opts.view.bearing,
      pitch: opts.view.pitch,
      attributionControl: false,
      hash: false,
      fadeDuration: 200,
    })
    this.map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: '© OpenStreetMap · OpenFreeMap',
      }),
      'bottom-left',
    )
    this.map.on('moveend', this.handleMoveEnd)
  }

  private handleMoveEnd = (): void => {
    if (this.suppressCallback) return
    const c = this.map.getCenter()
    this.onCameraChange({
      lat: c.lat,
      lon: c.lng,
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
    })
  }

  /** Programmatic camera update (won't echo back through onCameraChange). */
  setView(view: MapView, opts: { animate?: boolean } = {}): void {
    const same =
      Math.abs(this.map.getCenter().lng - view.lon) < 1e-9 &&
      Math.abs(this.map.getCenter().lat - view.lat) < 1e-9 &&
      Math.abs(this.map.getZoom() - view.zoom) < 1e-9 &&
      Math.abs(this.map.getBearing() - view.bearing) < 1e-9 &&
      Math.abs(this.map.getPitch() - view.pitch) < 1e-9
    if (same) return

    this.suppressCallback = true
    const target = {
      center: [view.lon, view.lat] as [number, number],
      zoom: view.zoom,
      bearing: view.bearing,
      pitch: view.pitch,
    }
    if (opts.animate) {
      this.map.easeTo({ ...target, duration: 400 })
    } else {
      this.map.jumpTo(target)
    }
    // re-enable next tick after maplibre fires its event
    queueMicrotask(() => {
      this.suppressCallback = false
    })
  }

  setStyle(styleUrl: string): void {
    this.map.setStyle(styleUrl, { diff: false })
  }

  getMap(): maplibregl.Map {
    return this.map
  }

  destroy(): void {
    this.map.off('moveend', this.handleMoveEnd)
    this.map.remove()
  }
}
