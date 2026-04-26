/**
 * Web Mercator helpers used by the export pipeline.
 * These are pure-function copies of the same math MapLibre uses internally,
 * so a `(center, zoom)` pair maps deterministically to pixel coordinates
 * regardless of which MapLibre instance is rendering.
 */

const TILE_SIZE = 512

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/** Convert (lon, lat) to fractional Web Mercator world pixels at a given zoom. */
export function lonLatToWorldPx(
  lng: number,
  lat: number,
  zoom: number,
): { x: number; y: number } {
  const scale = TILE_SIZE * Math.pow(2, zoom)
  const x = ((lng + 180) / 360) * scale
  const sinLat = Math.sin((clamp(lat, -85.05112878, 85.05112878) * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  return { x, y }
}

export function worldPxToLonLat(
  x: number,
  y: number,
  zoom: number,
): { lon: number; lat: number } {
  const scale = TILE_SIZE * Math.pow(2, zoom)
  const lon = (x / scale) * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / scale
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
  return { lon, lat }
}

/**
 * Given the live map's view (center + zoom) and an export size in pixels, work
 * out the lon/lat box that the export canvas will cover. The aspect ratio of
 * the box matches the export's aspect ratio, which is what we want — the
 * preview frame already enforces the same aspect on screen.
 */
export interface ExportProjection {
  centerLat: number
  centerLon: number
  zoom: number
  exportWidthPx: number
  exportHeightPx: number
}

export function lonLatToExportPx(
  proj: ExportProjection,
  lng: number,
  lat: number,
): { x: number; y: number } {
  const c = lonLatToWorldPx(proj.centerLon, proj.centerLat, proj.zoom)
  const p = lonLatToWorldPx(lng, lat, proj.zoom)
  return {
    x: proj.exportWidthPx / 2 + (p.x - c.x),
    y: proj.exportHeightPx / 2 + (p.y - c.y),
  }
}

/**
 * Compute the zoom level required so a viewport of `viewportWidthPx ×
 * viewportHeightPx` (in CSS pixels) shows the same geographic bounds as
 * an export of `exportWidthPx × exportHeightPx` would when rendered at
 * `viewZoom`. This lets us drive an offscreen MapLibre instance at any
 * pixel size while preserving the live preview's content.
 *
 * Derivation: at zoom z, 1 world-px = 1 screen-px. Halving viewport width
 * doubles the geographic span; we need to lower zoom by 1 for every 2x
 * smaller viewport.  Same for height. We pick the smaller adjustment so
 * the export contains *at least* what the live view shows.
 */
export function zoomForExport(
  liveZoom: number,
  liveViewportPx: number,
  exportPx: number,
): number {
  return liveZoom + Math.log2(exportPx / liveViewportPx)
}
