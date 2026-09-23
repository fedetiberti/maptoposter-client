/**
 * High-resolution export via tile-render-and-stitch.
 *
 * Strategy:
 *   1. Tile the export rectangle into TILE_SIDE × TILE_SIDE chunks (with
 *      OVERLAP px overlap on internal edges so anti-aliased line ends never
 *      meet at a seam).
 *   2. Reuse a single offscreen MapLibre instance, panning the camera to
 *      each tile's center at zoom = exportZoom and rendering at the tile
 *      pixel size.
 *   3. Blit each rendered tile onto a single 2D output canvas, omitting
 *      the overlap region from the destination rect.
 */
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import type { MapView } from '@/features/poster/domain/PosterState'
import { screenOffsetToLonLat } from '@/features/export/application/projection'
import {
  stableLoaded,
  waitForIdle,
  type SinglePassResult,
} from '@/features/export/application/singlePass'

/** Keep TILE_SIDE + 2·OVERLAP within MapLibre's safe 4096 px canvas. */
const TILE_SIDE = 4000
const OVERLAP = 32
const MAX_RENDER_SIDE = TILE_SIDE + 2 * OVERLAP

export interface TileRenderOpts {
  styleSpec: StyleSpecification
  view: MapView
  widthPx: number
  heightPx: number
  exportZoom: number
  onTileProgress?: (done: number, total: number) => void
}

export async function renderTiled(opts: TileRenderOpts): Promise<SinglePassResult> {
  const { widthPx, heightPx, view, styleSpec, exportZoom, onTileProgress } = opts
  const cols = Math.ceil(widthPx / TILE_SIDE)
  const rows = Math.ceil(heightPx / TILE_SIDE)
  const totalTiles = cols * rows

  // Output 2D canvas
  const out = document.createElement('canvas')
  out.width = widthPx
  out.height = heightPx
  const outCtx = out.getContext('2d', { willReadFrequently: false })
  if (!outCtx) throw new Error('2D context unavailable')

  // Tile centres are expressed as canvas-pixel offsets from the export centre
  // and projected through the (possibly rotated) camera, so each tile renders
  // with the real bearing and its pixels line up with the export axes.
  const tileCenterLonLat = (canvasX: number, canvasY: number) =>
    screenOffsetToLonLat(
      { lat: view.lat, lon: view.lon, zoom: exportZoom, bearing: view.bearing },
      canvasX - widthPx / 2,
      canvasY - heightPx / 2,
    )

  // Single offscreen MapLibre instance reused across tiles.
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute; left: -99999px; top: -99999px;
    width: ${Math.min(widthPx, MAX_RENDER_SIDE)}px; height: ${Math.min(heightPx, MAX_RENDER_SIDE)}px; visibility: hidden;
  `
  document.body.appendChild(container)

  const map = new maplibregl.Map({
    container,
    style: styleSpec,
    center: [view.lon, view.lat],
    zoom: exportZoom,
    bearing: view.bearing,
    pitch: 0,
    attributionControl: false,
    interactive: false,
    fadeDuration: 0,
    pixelRatio: 1,
    maxCanvasSize: [MAX_RENDER_SIDE, MAX_RENDER_SIDE],
    canvasContextAttributes: { preserveDrawingBuffer: true },
  })

  try {
    await waitForIdle(map)

    let done = 0
    onTileProgress?.(0, totalTiles)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Inner pixel rect (no overlap) we ultimately want in the output.
        const innerX = col * TILE_SIDE
        const innerY = row * TILE_SIDE
        const innerW = Math.min(TILE_SIDE, widthPx - innerX)
        const innerH = Math.min(TILE_SIDE, heightPx - innerY)

        // Render-time rect with overlap on internal edges only.
        const padLeft = col === 0 ? 0 : OVERLAP
        const padTop = row === 0 ? 0 : OVERLAP
        const padRight = col === cols - 1 ? 0 : OVERLAP
        const padBottom = row === rows - 1 ? 0 : OVERLAP
        const renderW = innerW + padLeft + padRight
        const renderH = innerH + padTop + padBottom

        // Canvas-pixel center of the *render* rect.
        const center = tileCenterLonLat(
          innerX - padLeft + renderW / 2,
          innerY - padTop + renderH / 2,
        )

        container.style.width = `${renderW}px`
        container.style.height = `${renderH}px`
        map.resize()
        map.jumpTo({ center: [center.lon, center.lat], zoom: exportZoom, bearing: view.bearing })
        await waitForIdle(map)
        await stableLoaded(map)

        const glCanvas = map.getCanvas()
        if (glCanvas.width !== renderW || glCanvas.height !== renderH) {
          throw new Error(
            `Renderer produced ${glCanvas.width}×${glCanvas.height} for a ${renderW}×${renderH} tile.`,
          )
        }
        // Source rect inside the render canvas excludes the overlap padding.
        outCtx.drawImage(glCanvas, padLeft, padTop, innerW, innerH, innerX, innerY, innerW, innerH)
        done += 1
        onTileProgress?.(done, totalTiles)
        // Yield to UI between tiles.
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))
      }
    }

    return {
      canvas: out,
      effectiveZoom: exportZoom,
      centerLat: view.lat,
      centerLon: view.lon,
    }
  } finally {
    map.remove()
    container.remove()
  }
}
