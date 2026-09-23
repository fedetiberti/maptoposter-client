import { resolveExportSize } from '@/features/layout/application/resolveExportSize'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { useFrameCenter } from '@/features/poster/application/useFrameCenter'

function fmtCoord(value: number, kind: 'lat' | 'lon'): string {
  const hemi =
    kind === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${Math.abs(value).toFixed(4)}° ${hemi}`
}

/** Approximate ground meters per CSS pixel at the given lat + zoom (web mercator, 512px tiles). */
function metersPerPixel(lat: number, zoom: number): number {
  return (
    (Math.cos((lat * Math.PI) / 180) * 2 * Math.PI * 6378137) /
    (512 * Math.pow(2, zoom))
  )
}

const SCALE_BAR_PX = 120

function fmtScale(mpp: number): string {
  const meters = mpp * SCALE_BAR_PX
  if (meters >= 1000) return `${(meters / 1000).toFixed(meters >= 10_000 ? 0 : 1)} km`
  return `${meters.toFixed(meters >= 100 ? 0 : 1)} m`
}

export function StatusBar() {
  const state = usePosterState()
  const center = useFrameCenter()
  const mpp = metersPerPixel(center.lat, state.view.zoom)

  const dpi = state.layout.dpi
  const { widthPx, heightPx } = resolveExportSize(state.layout)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-end justify-between gap-2 whitespace-nowrap px-3 pb-3">
      {/* Left: poster-centre coordinates + scale bar */}
      <div className="pointer-events-auto glass flex items-stretch gap-3 rounded-md px-3 py-1.5">
        <div className="readout flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground/60">LAT</span>
          <span className="text-foreground" data-testid="status-lat">
            {fmtCoord(center.lat, 'lat')}
          </span>
        </div>
        <div className="w-px self-stretch bg-[var(--rule-strong)]" aria-hidden />
        <div className="readout flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground/60">LON</span>
          <span className="text-foreground" data-testid="status-lon">
            {fmtCoord(center.lon, 'lon')}
          </span>
        </div>
        <div className="w-px self-stretch bg-[var(--rule-strong)]" aria-hidden />
        <div className="readout flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground/60">Z</span>
          <span className="text-foreground">{state.view.zoom.toFixed(2)}</span>
        </div>
        <div className="hidden w-px self-stretch bg-[var(--rule-strong)] sm:block" aria-hidden />
        <div className="hidden items-center gap-1.5 sm:flex" title="Ground distance covered by the bar">
          <div
            className="relative h-1 rounded-[1px]"
            style={{
              width: SCALE_BAR_PX,
              background: 'var(--rule-strong)',
              boxShadow: '0 0 0 1px oklch(1 0 0 / 6%) inset',
            }}
          >
            <div
              className="absolute inset-y-0 left-0 w-1/2 rounded-l-[1px]"
              style={{ background: 'var(--brass)' }}
            />
          </div>
          <span className="readout text-[10px] text-muted-foreground/80">{fmtScale(mpp)}</span>
        </div>
      </div>

      {/* Right: export size + attribution (OpenFreeMap / OpenMapTiles / OSM require credit) */}
      <div className="pointer-events-auto flex flex-wrap items-end gap-2">
        <div className="glass hidden items-baseline gap-1.5 rounded-md px-2.5 py-1.5 sm:flex">
          <span className="readout text-[10.5px] uppercase tracking-[0.18em] text-foreground/90">
            {widthPx}&times;{heightPx}
          </span>
          <span className="readout text-[9.5px] tracking-[0.18em] text-muted-foreground/70">
            {dpi}&nbsp;DPI
          </span>
        </div>
        <div className="glass rounded-md px-2.5 py-1.5 text-[9.5px] tracking-[0.12em] text-muted-foreground/80">
          ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            OpenStreetMap
          </a>
          {' · '}
          <a
            href="https://openmaptiles.org/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            OpenMapTiles
          </a>
          {' · '}
          <a
            href="https://openfreemap.org/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            OpenFreeMap
          </a>
        </div>
      </div>
    </div>
  )
}
