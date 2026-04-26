import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import type { MapView } from '@/features/poster/domain/PosterState'

export interface SinglePassOpts {
  styleSpec: StyleSpecification
  view: MapView
  widthPx: number
  heightPx: number
  /** Zoom level required so the export pixel bbox matches the live preview's geographic bbox. */
  exportZoom: number
}

export interface SinglePassResult {
  canvas: HTMLCanvasElement
  /** What the offscreen map actually rendered with — useful for projection math. */
  effectiveZoom: number
  /** Center used. */
  centerLat: number
  centerLon: number
}

/**
 * Render a single offscreen MapLibre frame at the requested pixel size and
 * return its WebGL canvas (or rather, a 2D copy of it sized to the request).
 * The caller is responsible for compositing overlays on top.
 */
export async function renderSinglePass(opts: SinglePassOpts): Promise<SinglePassResult> {
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    left: -99999px;
    top: -99999px;
    width: ${opts.widthPx}px;
    height: ${opts.heightPx}px;
    visibility: hidden;
  `
  document.body.appendChild(container)

  const map = new maplibregl.Map({
    container,
    style: opts.styleSpec,
    center: [opts.view.lon, opts.view.lat],
    zoom: opts.exportZoom,
    bearing: opts.view.bearing,
    pitch: 0,
    attributionControl: false,
    interactive: false,
    fadeDuration: 0,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  })

  try {
    await waitForIdle(map)
    // Sometimes MapLibre's idle event fires before all tiles are textured.
    // Require areTilesLoaded()==true twice 100ms apart.
    await stableLoaded(map)

    // Copy GL canvas into a fresh 2D canvas so we can composite onto it.
    const glCanvas = map.getCanvas()
    const out = document.createElement('canvas')
    out.width = opts.widthPx
    out.height = opts.heightPx
    const ctx = out.getContext('2d', { willReadFrequently: false })
    if (!ctx) throw new Error('2D context unavailable')
    ctx.drawImage(glCanvas, 0, 0, opts.widthPx, opts.heightPx)
    return {
      canvas: out,
      effectiveZoom: map.getZoom(),
      centerLat: map.getCenter().lat,
      centerLon: map.getCenter().lng,
    }
  } finally {
    map.remove()
    container.remove()
  }
}

function waitForIdle(map: maplibregl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.loaded() && map.isStyleLoaded() && map.areTilesLoaded()) {
      resolve()
      return
    }
    const handler = () => {
      if (map.loaded() && map.isStyleLoaded() && map.areTilesLoaded()) {
        map.off('idle', handler)
        resolve()
      }
    }
    map.on('idle', handler)
  })
}

function stableLoaded(map: maplibregl.Map): Promise<void> {
  return new Promise((resolve) => {
    let confirms = 0
    const tick = () => {
      if (map.areTilesLoaded()) {
        confirms += 1
        if (confirms >= 2) {
          resolve()
          return
        }
      } else {
        confirms = 0
      }
      window.setTimeout(tick, 100)
    }
    tick()
  })
}
