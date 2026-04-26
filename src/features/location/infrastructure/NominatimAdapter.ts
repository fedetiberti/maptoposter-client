import type { ICache, IHttp } from '@/core/ports'
import type { Place } from '@/features/location/domain/Place'

interface NominatimResult {
  place_id: number
  osm_type?: string
  osm_id?: number
  lat: string
  lon: string
  display_name: string
  boundingbox?: [string, string, string, string]
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    country?: string
    country_code?: string
  }
}

const SEARCH_TTL_MS = 24 * 60 * 60 * 1000
const REVERSE_TTL_MS = 60 * 60 * 1000

/**
 * Polite gating: Nominatim's terms request <=1 req/sec from a single client.
 * We serialize through a chained promise.
 */
class RequestGate {
  private chain: Promise<unknown> = Promise.resolve()
  private lastAt = 0
  private readonly minIntervalMs: number

  constructor(minIntervalMs = 1000) {
    this.minIntervalMs = minIntervalMs
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(async () => {
      const elapsed = Date.now() - this.lastAt
      const wait = Math.max(0, this.minIntervalMs - elapsed)
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      try {
        return await fn()
      } finally {
        this.lastAt = Date.now()
      }
    })
    this.chain = next.catch(() => undefined)
    return next
  }
}

function pickCity(addr: NominatimResult['address']): string | null {
  if (!addr) return null
  return (
    addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.state ?? null
  )
}

function toPlace(r: NominatimResult): Place {
  const lat = Number(r.lat)
  const lon = Number(r.lon)
  const id = r.osm_type && r.osm_id ? `${r.osm_type}:${r.osm_id}` : `${lat},${lon}`
  let bbox: [number, number, number, number] | null = null
  if (r.boundingbox && r.boundingbox.length === 4) {
    const [s, n, w, e] = r.boundingbox.map(Number)
    if (
      Number.isFinite(s) &&
      Number.isFinite(n) &&
      Number.isFinite(w) &&
      Number.isFinite(e)
    ) {
      bbox = [w as number, s as number, e as number, n as number]
    }
  }
  return {
    id,
    displayName: r.display_name,
    city: pickCity(r.address),
    country: r.address?.country ?? null,
    countryCode: r.address?.country_code?.toUpperCase() ?? null,
    lat,
    lon,
    boundingBox: bbox,
  }
}

export class NominatimAdapter {
  private readonly gate = new RequestGate()
  private readonly http: IHttp
  private readonly cache: ICache
  private readonly baseUrl: string

  constructor(http: IHttp, cache: ICache, baseUrl: string) {
    this.http = http
    this.cache = cache
    this.baseUrl = baseUrl
  }

  async search(query: string, opts: { signal?: AbortSignal } = {}): Promise<Place[]> {
    const q = query.trim()
    if (q.length < 2) return []
    const cacheKey = `nominatim:search:${q.toLowerCase()}`
    const cached = this.cache.get<Place[]>(cacheKey)
    if (cached) return cached

    const url = new URL(`${this.baseUrl}/search`)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('q', q)
    url.searchParams.set('limit', '8')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('accept-language', navigator.language || 'en')

    const results = await this.gate.run(() =>
      this.http.get<NominatimResult[]>(url.toString(), {
        signal: opts.signal,
        headers: { Accept: 'application/json' },
      }),
    )
    const places = results.map(toPlace)
    this.cache.set(cacheKey, places, SEARCH_TTL_MS)
    return places
  }

  async reverse(
    lat: number,
    lon: number,
    opts: { signal?: AbortSignal } = {},
  ): Promise<Place | null> {
    const key = `nominatim:reverse:${lat.toFixed(4)},${lon.toFixed(4)}`
    const cached = this.cache.get<Place | null>(key)
    if (cached !== null) return cached

    const url = new URL(`${this.baseUrl}/reverse`)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lon))
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('zoom', '12')
    url.searchParams.set('accept-language', navigator.language || 'en')

    try {
      const r = await this.gate.run(() =>
        this.http.get<NominatimResult>(url.toString(), {
          signal: opts.signal,
          headers: { Accept: 'application/json' },
        }),
      )
      const place = toPlace(r)
      this.cache.set(key, place, REVERSE_TTL_MS)
      return place
    } catch {
      return null
    }
  }
}
