export interface Place {
  /** Stable identifier (osm_type + osm_id when present, else lat/lon hash). */
  id: string
  displayName: string
  city: string | null
  country: string | null
  countryCode: string | null
  lat: number
  lon: number
  /** [west, south, east, north] in degrees, when available. */
  boundingBox: [number, number, number, number] | null
}

/** Last value clamping for human-typed coords. */
export function clampLat(v: number): number {
  return Math.max(-90, Math.min(90, v))
}
export function clampLon(v: number): number {
  return Math.max(-180, Math.min(180, v))
}
