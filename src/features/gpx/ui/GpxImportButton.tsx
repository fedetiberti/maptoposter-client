import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { parseGpx } from '@/features/gpx/infrastructure/parseGpx'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'

function fmtKm(m: number): string {
  if (m < 1000) return `${m.toFixed(0)} m`
  return `${(m / 1000).toFixed(2)} km`
}

export function GpxImportButton() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const gpx = state.gpx

  async function onFile(file: File): Promise<void> {
    setError(null)
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large (max 20 MB)')
      return
    }
    try {
      const text = await file.text()
      const parsed = parseGpx(text, file.name)
      if (!parsed) {
        setError('Could not parse GPX (need at least 2 track/route points)')
        return
      }
      dispatch({ type: 'SET_GPX', gpx: parsed })

      // Center the view on the track midpoint.
      const coords = parsed.geoJson.coordinates
      const mid = coords[Math.floor(coords.length / 2)]
      if (mid) {
        dispatch({ type: 'SET_VIEW', view: { lon: mid[0], lat: mid[1] } })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'GPX parse failed')
    }
  }

  return (
    <div className="space-y-1.5 text-sm">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        GPX track
      </h3>
      {gpx ? (
        <div className="rounded-md border border-border/60 bg-card/40 p-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] text-foreground">
                {gpx.fileName}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {gpx.geoJson.coordinates.length} pts · {fmtKm(gpx.lengthMeters)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_GPX', gpx: null })}
              className="rounded p-1 text-muted-foreground hover:bg-card hover:text-destructive"
              aria-label="Remove GPX"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border/60 bg-card/20 px-2 py-2 text-[11px] text-muted-foreground hover:bg-card/50 hover:text-foreground"
        >
          <Upload size={12} />
          Import .gpx
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  )
}
