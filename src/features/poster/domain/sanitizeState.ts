import {
  DEFAULT_POSTER_STATE,
  LAYER_TOGGLE_IDS,
  THEME_COLOR_KEYS,
  type LayerToggles,
  type LayoutSelection,
  type Marker,
  type PosterState,
  type ThemeColorKey,
} from '@/features/poster/domain/PosterState'

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function num(v: unknown, fallback: number, lo = -Infinity, hi = Infinity): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

function strOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function hex(v: unknown, fallback: string): string {
  return typeof v === 'string' && HEX_RE.test(v.trim()) ? v.trim() : fallback
}

function sanitizeLayers(v: unknown): LayerToggles {
  const out = { ...DEFAULT_POSTER_STATE.layers }
  if (!isRecord(v)) return out
  for (const id of LAYER_TOGGLE_IDS) out[id] = bool(v[id], out[id])
  return out
}

function sanitizeOverrides(v: unknown): Partial<Record<ThemeColorKey, string>> {
  const out: Partial<Record<ThemeColorKey, string>> = {}
  if (!isRecord(v)) return out
  for (const key of THEME_COLOR_KEYS) {
    const val = v[key]
    if (typeof val === 'string' && HEX_RE.test(val.trim())) out[key] = val.trim()
  }
  return out
}

function sanitizeLayout(v: unknown): LayoutSelection {
  const d = DEFAULT_POSTER_STATE.layout
  if (!isRecord(v)) return d
  const dpi = num(v.dpi, d.dpi, 36, 1200)
  if (v.kind === 'custom') {
    return {
      kind: 'custom',
      widthPx: Math.round(num(v.widthPx, 2480, 64, 16384)),
      heightPx: Math.round(num(v.heightPx, 3508, 64, 16384)),
      dpi,
    }
  }
  return { kind: 'preset', presetId: str(v.presetId, d.kind === 'preset' ? d.presetId : 'a4-portrait'), dpi }
}

function sanitizeMarkers(v: unknown): Marker[] {
  if (!Array.isArray(v)) return []
  const out: Marker[] = []
  for (const m of v.slice(0, 200)) {
    if (!isRecord(m)) continue
    const lat = num(m.lat, NaN, -90, 90)
    const lon = num(m.lon, NaN, -180, 180)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    out.push({
      id: str(m.id, `m-${out.length}`),
      lat,
      lon,
      iconId: str(m.iconId, 'pin'),
      color: hex(m.color, '#FF3B30'),
      sizePx: Math.round(num(m.sizePx, 28, 8, 256)),
    })
  }
  return out
}

/**
 * Turn untrusted JSON (localStorage, share hash) into a well-formed
 * PosterState. Every nested object is merged field-by-field over the defaults
 * so a stale or hand-edited payload can never leave a hole in the state shape.
 * GPX is never restored from persistence.
 */
export function sanitizePosterState(raw: unknown): PosterState {
  const d = DEFAULT_POSTER_STATE
  if (!isRecord(raw)) return d
  const view = isRecord(raw.view) ? raw.view : {}
  const theme = isRecord(raw.theme) ? raw.theme : {}
  const title = isRecord(raw.title) ? raw.title : {}
  const font = isRecord(raw.font) ? raw.font : {}
  const exportSettings = isRecord(raw.exportSettings) ? raw.exportSettings : {}
  const format = exportSettings.format
  return {
    view: {
      lat: num(view.lat, d.view.lat, -85.05, 85.05),
      lon: num(view.lon, d.view.lon, -180, 180),
      zoom: num(view.zoom, d.view.zoom, 0, 22),
      bearing: num(view.bearing, 0, -180, 180),
      pitch: 0,
    },
    theme: {
      id: str(theme.id, d.theme.id),
      overrides: sanitizeOverrides(theme.overrides),
    },
    layers: sanitizeLayers(raw.layers),
    title: {
      city: str(title.city, d.title.city),
      country: str(title.country, d.title.country),
      cityLabel: strOrNull(title.cityLabel),
      countryLabel: strOrNull(title.countryLabel),
      showCoordinates: bool(title.showCoordinates, d.title.showCoordinates),
    },
    font: {
      id: str(font.id, d.font.id),
      googleFamily: strOrNull(font.googleFamily),
      weight: Math.round(num(font.weight, d.font.weight, 100, 900)),
    },
    markers: sanitizeMarkers(raw.markers),
    gpx: null,
    layout: sanitizeLayout(raw.layout),
    exportSettings: {
      format: format === 'png' || format === 'pdf' || format === 'svg' ? format : d.exportSettings.format,
      dpi: num(exportSettings.dpi, d.exportSettings.dpi, 36, 1200),
      showLabels: bool(exportSettings.showLabels, d.exportSettings.showLabels),
    },
    reverseGeocodeOnPan: bool(raw.reverseGeocodeOnPan, d.reverseGeocodeOnPan),
  }
}
