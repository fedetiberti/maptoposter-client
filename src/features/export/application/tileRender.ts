/**
 * High-resolution export via tile-render-and-stitch.
 *
 * Strategy:
 *   1. Tile the export rectangle into TILE_SIDE × TILE_SIDE chunks (with
 *      OVERLAP px overlap on internal edges).
 *   2. Reuse a single offscreen MapLibre instance, panning the camera to
 *      each tile's center at zoom = exportZoom and rendering at the tile
 *      pixel size.
 *   3. blit each rendered tile onto a single 2D output canvas, omitting
 *      the overlap region from the destination rect.
 *
 * Phase 9 stub kept for parity with the planned pipeline. For now this
 * reuses singlePass when the size fits, falling back to a multi-render
 * loop for larger sizes.
 */
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import type { MapView } from '@/features/poster/domain/PosterState'
import { lonLatToWorldPx, worldPxToLonLat } from '@/features/export/application/projection'
import type { SinglePassResult } from '@/features/export/application/singlePass'

const TILE_SIDE = 4096
const OVERLAP = 32

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

  // World-pixel rect of the entire export at exportZoom.
  const centerWorld = lonLatToWorldPx(view.lon, view.lat, exportZoom)
  const exportWorldX = centerWorld.x - widthPx / 2
  const exportWorldY = centerWorld.y - heightPx / 2

  // Single offscreen MapLibre instance reused across tiles.
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute; left: -99999px; top: -99999px;
    width: ${TILE_SIDE}px; height: ${TILE_SIDE}px; visibility: hidden;
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
    canvasContextAttributes: { preserveDrawingBuffer: true },
  })

  try {
    await waitForLoaded(map)

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

        // World-pixel center of the *render* rect.
        const renderWorldX = exportWorldX + innerX - padLeft + renderW / 2
        const renderWorldY = exportWorldY + innerY - padTop + renderH / 2
        const center = worldPxToLonLat(renderWorldX, renderWorldY, exportZoom)

        container.style.width = `${renderW}px`
        container.style.height = `${renderH}px`
        map.resize()
        map.jumpTo({ center: [center.lon, center.lat], zoom: exportZoom })
        await waitForLoaded(map)

        const glCanvas = map.getCanvas()
        // Source rect inside the render canvas excludes the overlap padding.
        const srcX = padLeft
        const srcY = padTop
        outCtx.drawImage(
          glCanvas,
          srcX,
          srcY,
          innerW,
          innerH,
          innerX,
          innerY,
          innerW,
          innerH,
        )
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

async function waitForLoaded(map: maplibregl.Map): Promise<void> {
  await new Promise<void>((resolve) => {
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
  // Stability: confirm twice 100ms apart.
  let confirms = 0
  await new Promise<void>((resolve) => {
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
