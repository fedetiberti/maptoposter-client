import type { GpxState } from '@/features/poster/domain/PosterState'
import { polylineLengthMeters } from '@/shared/geo/haversine'

/**
 * Parse a GPX XML string into a single MultiTrack-like LineString combining
 * every <trkpt> in the order they appear. Returns null on malformed input.
 */
export function parseGpx(xml: string, fileName: string): GpxState | null {
  let doc: Document
  try {
    doc = new DOMParser().parseFromString(xml, 'application/xml')
  } catch {
    return null
  }
  const parserError = doc.getElementsByTagName('parsererror')[0]
  if (parserError) return null

  const trkpts = doc.getElementsByTagName('trkpt')
  const rtepts = doc.getElementsByTagName('rtept')
  const wpts = doc.getElementsByTagName('wpt')
  // Prefer trkpts > rtepts > wpts (matches user intent for "track").
  const points =
    trkpts.length > 0 ? trkpts : rtepts.length > 0 ? rtepts : wpts.length > 0 ? wpts : null
  if (!points || points.length < 2) return null

  const coords: [number, number][] = []
  for (let i = 0; i < points.length; i++) {
    const el = points[i]
    if (!el) continue
    const latStr = el.getAttribute('lat')
    const lonStr = el.getAttribute('lon')
    if (!latStr || !lonStr) continue
    const lat = parseFloat(latStr)
    const lon = parseFloat(lonStr)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    coords.push([lon, lat])
  }
  if (coords.length < 2) return null

  const lengthMeters = polylineLengthMeters(coords)
  return {
    fileName,
    geoJson: { type: 'LineString', coordinates: coords },
    lengthMeters,
    color: null,
  }
}
