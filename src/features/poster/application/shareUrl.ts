import LZString from 'lz-string'
import {
  DEFAULT_POSTER_STATE,
  type PosterState,
} from '@/features/poster/domain/PosterState'

const HASH_PREFIX = '#s='

/** Pack the user-meaningful subset of state and compress to URL-safe base64. */
export function encodeShare(state: PosterState): string {
  const payload = {
    v: 1,
    view: state.view,
    theme: state.theme,
    layers: state.layers,
    title: state.title,
    font: state.font,
    markers: state.markers,
    layout: state.layout,
    exportSettings: state.exportSettings,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeShare(encoded: string): PosterState | null {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(encoded)
    if (!raw) return null
    const payload = JSON.parse(raw) as Partial<PosterState> & { v?: number }
    return { ...DEFAULT_POSTER_STATE, ...payload, gpx: null }
  } catch {
    return null
  }
}

export function buildShareUrl(state: PosterState): string {
  return `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${encodeShare(state)}`
}

export function readShareFromHash(): PosterState | null {
  if (!window.location.hash.startsWith(HASH_PREFIX)) return null
  return decodeShare(window.location.hash.slice(HASH_PREFIX.length))
}

export function clearShareHash(): void {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}
