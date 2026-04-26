import { usePosterState } from '@/features/poster/application/PosterContext'

/**
 * Top-left atelier mark. Tiny, monospace, with a single brass dot —
 * gives the screen an identity without competing with the poster.
 */
export function BrandOverlay() {
  const { title } = usePosterState()
  const city = (title.cityLabel ?? title.city ?? '').toUpperCase()
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-start gap-2">
      <div className="pointer-events-auto glass flex items-center gap-2 rounded-md px-2.5 py-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <circle cx="7" cy="7" r="2.5" fill="var(--brass)" />
          <line x1="7" y1="0" x2="7" y2="2.5" stroke="currentColor" strokeOpacity="0.5" />
          <line x1="7" y1="11.5" x2="7" y2="14" stroke="currentColor" strokeOpacity="0.5" />
          <line x1="0" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeOpacity="0.5" />
          <line x1="11.5" y1="7" x2="14" y2="7" stroke="currentColor" strokeOpacity="0.5" />
        </svg>
        <span className="readout text-[10.5px] uppercase tracking-[0.22em] text-foreground/90">
          maptoposter
        </span>
        <span className="text-[10px] tracking-[0.18em] text-muted-foreground/60">
          / atelier
        </span>
      </div>
      {city && (
        <div className="pointer-events-auto rounded-md px-2.5 py-1.5">
          <div className="readout text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            currently
          </div>
          <div className="readout text-[14px] uppercase tracking-[0.18em] text-foreground">
            {city}
          </div>
        </div>
      )}
    </div>
  )
}
