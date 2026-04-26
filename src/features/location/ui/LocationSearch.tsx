import { useState } from 'react'
import { useLocationSearch } from '@/features/location/application/useLocationSearch'
import { usePosterDispatch } from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'
import type { Place } from '@/features/location/domain/Place'

function zoomForBbox(bbox: [number, number, number, number] | null): number {
  if (!bbox) return 13
  const [w, s, e, n] = bbox
  const widthDeg = Math.max(0.0001, e - w)
  const heightDeg = Math.max(0.0001, n - s)
  // Heuristic: smaller bbox → higher zoom. World ~360°, zoom 1 ≈ entire world.
  const span = Math.max(widthDeg, heightDeg)
  if (span > 30) return 4
  if (span > 10) return 6
  if (span > 3) return 8
  if (span > 1) return 10
  if (span > 0.3) return 11.5
  if (span > 0.1) return 12.5
  if (span > 0.03) return 13.5
  return 14.5
}

export function LocationSearch() {
  const { query, setQuery, results, loading, error, reset } = useLocationSearch()
  const dispatch = usePosterDispatch()
  const [focused, setFocused] = useState(false)

  function selectPlace(p: Place): void {
    dispatch({
      type: 'SET_VIEW',
      view: { lat: p.lat, lon: p.lon, zoom: zoomForBbox(p.boundingBox) },
    })
    dispatch({
      type: 'SET_TITLE',
      patch: {
        city: p.city ?? query.split(',')[0]?.trim() ?? '',
        country: p.country ?? '',
      },
    })
    reset()
    setFocused(false)
  }

  const showResults = focused && (loading || results.length > 0 || error || query.length >= 2)

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Search location
      </label>
      <input
        type="search"
        value={query}
        placeholder="city, country"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        className={cn(
          'w-full rounded-md border border-border/60 bg-background/70 px-3 py-2 text-sm',
          'text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring',
        )}
      />
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-y-auto rounded-md border border-border/60 bg-popover p-1 shadow-2xl">
          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
          )}
          {error && (
            <div className="px-3 py-2 text-xs text-destructive">{error}</div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && !error && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No results
            </div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => selectPlace(p)}
              className="flex w-full flex-col items-start gap-0.5 rounded px-2.5 py-1.5 text-left text-[12px] hover:bg-card"
            >
              <span className="truncate font-medium text-foreground">
                {p.city ?? p.displayName.split(',')[0]?.trim()}
                {p.country ? `, ${p.country}` : ''}
              </span>
              <span className="line-clamp-1 text-[11px] text-muted-foreground">
                {p.displayName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
