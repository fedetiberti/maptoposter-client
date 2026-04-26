import { findLayout, LAYOUTS } from '@/data/layouts'
import { exportSize } from '@/features/layout/domain/Layout'
import { usePosterState } from '@/features/poster/application/PosterContext'

function fmtCoord(value: number, kind: 'lat' | 'lon'): string {
  const hemi =
    kind === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${Math.abs(value).toFixed(4)}° ${hemi}`
}

/** Approximate ground meters per CSS pixel at the given lat + zoom (web mercator). */
function metersPerPixel(lat: number, zoom: number): number {
  return (
    (Math.cos((lat * Math.PI) / 180) * 2 * Math.PI * 6378137) /
    (256 * Math.pow(2, zoom))
  )
}

function fmtScale(mpp: number): string {
  // ~120px scale bar
  const px = 120
  const meters = mpp * px
  if (meters >= 1000) return `${(meters / 1000).toFixed(meters >= 10_000 ? 0 : 1)} km`
  return `${meters.toFixed(meters >= 100 ? 0 : 1)} m`
}

export function StatusBar() {
  const state = usePosterState()
  const mpp = metersPerPixel(state.view.lat, state.view.zoom)

  const dpi = state.layout.dpi
  let widthPx = 0
  let heightPx = 0
  if (state.layout.kind === 'preset') {
    const layout = findLayout(state.layout.presetId) ?? LAYOUTS[3]
    if (layout) {
      const s = exportSize(layout, dpi)
      widthPx = s.widthPx
      heightPx = s.heightPx
    }
  } else {
    widthPx = state.layout.widthPx
    heightPx = state.layout.heightPx
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 px-3 pb-3">
      {/* Left: brand mark */}
      <div className="pointer-events-auto glass flex items-center gap-2 rounded-md px-2.5 py-1.5">
        <span
          className="block size-1.5 rounded-full"
          style={{ background: 'var(--brass)', boxShadow: '0 0 6px var(--brass-dim)' }}
          aria-hidden
        />
        <span className="readout text-[10.5px] uppercase tracking-[0.22em] text-foreground/90">
          maptoposter
        </span>
        <span className="ml-1 text-[10px] tracking-[0.18em] text-muted-foreground/80">
          A1 / 400&nbsp;DPI
        </span>
      </div>

      {/* Center: live coordinates + scale bar */}
      <div className="pointer-events-auto glass flex items-stretch gap-3 rounded-md px-3 py-1.5">
        <div className="flex items-center gap-2 readout text-[11px]">
          <span className="text-muted-foreground/60">LAT</span>
          <span className="text-foreground">{fmtCoord(state.view.lat, 'lat')}</span>
        </div>
        <div className="w-px self-stretch bg-[var(--rule-strong)]" aria-hidden />
        <div className="flex items-center gap-2 readout text-[11px]">
          <span className="text-muted-foreground/60">LON</span>
          <span className="text-foreground">{fmtCoord(state.view.lon, 'lon')}</span>
        </div>
        <div className="w-px self-stretch bg-[var(--rule-strong)]" aria-hidden />
        <div className="flex items-center gap-2 readout text-[11px]">
          <span className="text-muted-foreground/60">Z</span>
          <span className="text-foreground">{state.view.zoom.toFixed(2)}</span>
        </div>
        <div className="w-px self-stretch bg-[var(--rule-strong)]" aria-hidden />
        <div className="flex items-end gap-1">
          <div className="flex flex-col items-stretch">
            <div
              className="relative h-1 w-[120px] rounded-[1px]"
              style={{
                background: 'var(--rule-strong)',
                boxShadow: '0 0 0 1px oklch(1 0 0 / 6%) inset',
              }}
            >
              <div
                className="absolute inset-y-0 left-0 w-1/2 rounded-l-[1px]"
                style={{ background: 'var(--brass)' }}
              />
            </div>
          </div>
          <span className="readout text-[10px] text-muted-foreground/80">
            {fmtScale(mpp)}
          </span>
        </div>
      </div>

      {/* Right: layout dimensions + DPI + attribution */}
      <div className="pointer-events-auto flex items-end gap-2">
        <div className="glass flex flex-col items-end gap-0.5 rounded-md px-2.5 py-1.5">
          <span className="readout text-[10.5px] uppercase tracking-[0.18em] text-foreground/90">
            {widthPx}&times;{heightPx}
          </span>
          <span className="readout text-[9.5px] tracking-[0.18em] text-muted-foreground/70">
            {dpi}&nbsp;DPI
          </span>
        </div>
        <div className="glass rounded-md px-2.5 py-1.5">
          <span className="text-[9.5px] tracking-[0.16em] text-muted-foreground/80">
            ©&nbsp;OSM&nbsp;·&nbsp;OpenFreeMap
          </span>
        </div>
      </div>
    </div>
  )
}
