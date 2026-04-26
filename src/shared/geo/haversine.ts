const EARTH_RADIUS_M = 6_371_000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Great-circle distance in meters between two lon/lat points. */
export function haversineMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Sum haversine distances along a polyline. Coordinates are [lon, lat]. */
export function polylineLengthMeters(coords: readonly [number, number][]): number {
  let sum = 0
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1]
    const b = coords[i]
    if (!a || !b) continue
    sum += haversineMeters({ lat: a[1], lon: a[0] }, { lat: b[1], lon: b[0] })
  }
  return sum
}
