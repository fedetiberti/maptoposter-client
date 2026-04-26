import { useEffect, useState } from 'react'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { clampLat, clampLon } from '@/features/location/domain/Place'
import { cn } from '@/lib/utils'

/** Manual lat/lon entry — bypasses geocoding entirely. */
export function CoordinateInput() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const [lat, setLat] = useState(state.view.lat.toFixed(6))
  const [lon, setLon] = useState(state.view.lon.toFixed(6))

  // Keep inputs in sync with external view changes (search, drag, etc.).
  useEffect(() => {
    setLat(state.view.lat.toFixed(6))
    setLon(state.view.lon.toFixed(6))
  }, [state.view.lat, state.view.lon])

  function commit(): void {
    const la = parseFloat(lat)
    const lo = parseFloat(lon)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return
    dispatch({
      type: 'SET_VIEW',
      view: { lat: clampLat(la), lon: clampLon(lo) },
    })
  }

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Manual coordinates
      </label>
      <div className="grid grid-cols-2 gap-2">
        <CoordField
          label="Lat"
          value={lat}
          onChange={setLat}
          onCommit={commit}
          min={-90}
          max={90}
        />
        <CoordField
          label="Lon"
          value={lon}
          onChange={setLon}
          onCommit={commit}
          min={-180}
          max={180}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground/70">
        Bypasses geocoding · press Enter to apply
      </p>
    </div>
  )
}

function CoordField({
  label,
  value,
  onChange,
  onCommit,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  min: number
  max: number
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        step="0.000001"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        className={cn(
          'min-w-0 flex-1 bg-transparent font-mono text-[12px] text-foreground outline-none',
          '[appearance:textfield]',
          '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
    </label>
  )
}
