import type { PosterState } from '@/features/poster/domain/PosterState'
import { sanitizePosterState } from '@/features/poster/domain/sanitizeState'

const KEY = 'mtp.poster.state.v1'

/** Strip GPX (large geojson) before persisting to keep localStorage tiny. */
function shrinkForStorage(state: PosterState): PosterState {
  return { ...state, gpx: null }
}

export function loadPersistedState(): PosterState | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    return sanitizePosterState(JSON.parse(raw))
  } catch {
    return null
  }
}

let saveTimer: number | null = null

export function persistState(state: PosterState, debounceMs = 500): void {
  if (saveTimer) window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(shrinkForStorage(state)))
    } catch {
      // ignore quota / private mode
    }
  }, debounceMs)
}

export function clearPersistedState(): void {
  if (saveTimer) window.clearTimeout(saveTimer)
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
