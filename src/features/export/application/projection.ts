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
  /** Camera bearing in degrees (0 = north up). */
  bearing: number
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
  const wx = p.x - c.x
  const wy = p.y - c.y
  // Inverse of screenOffsetToLonLat's rotation: world → canvas.
  const theta = (proj.bearing * Math.PI) / 180
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  return {
    x: proj.exportWidthPx / 2 + (cos * wx + sin * wy),
    y: proj.exportHeightPx / 2 + (-sin * wx + cos * wy),
  }
}

/**
 * Convert a screen-pixel offset from the map's centre into the lon/lat under
 * it, honouring the camera bearing (pitch is not supported by the poster
 * camera, so a pure 2D rotation is exact).
 *
 * At zoom z one world-px equals one CSS px, so the screen offset is a
 * world-px offset once un-rotated by the bearing: with bearing θ the map is
 * rotated so that "up" on screen points θ degrees clockwise from north.
 */
export function screenOffsetToLonLat(
  view: { lat: number; lon: number; zoom: number; bearing: number },
  dx: number,
  dy: number,
): { lon: number; lat: number } {
  const theta = (view.bearing * Math.PI) / 180
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const wx = cos * dx - sin * dy
  const wy = sin * dx + cos * dy
  const c = lonLatToWorldPx(view.lon, view.lat, view.zoom)
  return worldPxToLonLat(c.x + wx, c.y + wy, view.zoom)
}
