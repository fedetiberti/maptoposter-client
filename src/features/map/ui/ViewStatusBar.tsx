import { usePosterState } from '@/features/poster/application/PosterContext'

function fmtCoord(value: number, kind: 'lat' | 'lon'): string {
  const hemi =
    kind === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${Math.abs(value).toFixed(4)}° ${hemi}`
}

export function ViewStatusBar() {
  const { view } = usePosterState()
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-4 pb-3">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur-md">
        <span>{fmtCoord(view.lat, 'lat')}</span>
        <span className="opacity-40">/</span>
        <span>{fmtCoord(view.lon, 'lon')}</span>
        <span className="opacity-40">·</span>
        <span>z {view.zoom.toFixed(2)}</span>
      </div>
      <div className="pointer-events-auto rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-md">
        © OpenStreetMap · OpenFreeMap
      </div>
    </div>
  )
}
