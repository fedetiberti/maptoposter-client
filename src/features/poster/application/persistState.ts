import {
  DEFAULT_POSTER_STATE,
  type PosterState,
} from '@/features/poster/domain/PosterState'

const KEY = 'mtp.poster.state.v1'

/** Strip GPX (large geojson) before persisting to keep localStorage tiny. */
function shrinkForStorage(state: PosterState): PosterState {
  return { ...state, gpx: null }
}

export function loadPersistedState(): PosterState | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PosterState>
    // Best-effort merge with defaults so missing fields backfill on schema growth.
    return { ...DEFAULT_POSTER_STATE, ...parsed }
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
      // ignore quota
    }
  }, debounceMs)
}

export function clearPersistedState(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
