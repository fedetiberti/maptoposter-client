import { Download, Loader2 } from 'lucide-react'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { useExportRunner } from '@/features/export/application/ExportRunnerContext'
import {
  SINGLE_PASS_MAX_SIDE,
  SVG_MAX_PIXELS,
} from '@/features/export/application/exportPipeline'
import type { ExportFormat } from '@/features/poster/domain/PosterState'
import { resolveExportSize } from '@/features/layout/application/resolveExportSize'
import { cn } from '@/lib/utils'

const FORMATS: ReadonlyArray<{ id: ExportFormat; label: string; blurb: string }> = [
  { id: 'png', label: 'PNG', blurb: 'Lossless raster with DPI metadata — best for print shops.' },
  { id: 'pdf', label: 'PDF', blurb: 'Single page at the physical size, JPEG-compressed inside.' },
  { id: 'svg', label: 'SVG', blurb: 'Raster wrapped in an SVG container (not vector paths).' },
]

export function ExportPanel() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const { exporting, progress, error, start } = useExportRunner()

  const size = resolveExportSize(state.layout)
  const tiled = Math.max(size.widthPx, size.heightPx) > SINGLE_PASS_MAX_SIDE
  const format = state.exportSettings.format
  const svgTooBig = format === 'svg' && size.widthPx * size.heightPx > SVG_MAX_PIXELS
  const physical =
    size.layout?.physical
      ? `${size.layout.physical.w}×${size.layout.physical.h} ${size.layout.physical.unit}`
      : `${(size.physicalWidthIn * 2.54).toFixed(1)}×${(size.physicalHeightIn * 2.54).toFixed(1)} cm`

  return (
    <div className="space-y-3 text-sm">
      <div>
        <h3 className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Format
        </h3>
        <div className="flex items-center gap-1 rounded-full bg-card/40 p-0.5" role="radiogroup">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={format === f.id}
              onClick={() => dispatch({ type: 'SET_EXPORT', patch: { format: f.id } })}
              className={cn(
                'flex-1 rounded-full px-2 py-1 text-[11px] uppercase tracking-wider transition',
                format === f.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10.5px] text-muted-foreground/80">
          {FORMATS.find((f) => f.id === format)?.blurb}
        </p>
      </div>

      <div className="space-y-1 rounded-md bg-card/30 px-2.5 py-2">
        <div className="readout text-[11px] text-foreground">
          {size.widthPx}×{size.heightPx} px
        </div>
        <div className="readout text-[10.5px] text-muted-foreground">
          {size.megapixels.toFixed(1)} MP · {physical} @ {state.layout.dpi} DPI
        </div>
        {tiled && (
          <div className="pt-1 text-[10px] text-amber-300/80">
            Rendered in {Math.ceil(size.widthPx / 4000) * Math.ceil(size.heightPx / 4000)} tiles
            — large exports can take a minute and use a lot of memory.
          </div>
        )}
        {svgTooBig && (
          <div className="pt-1 text-[10px] text-destructive">
            SVG embeds the raster as base64 and would exceed browser limits at this size.
            Choose PNG/PDF or a smaller size.
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={exporting || svgTooBig}
        onClick={start}
        className={cn(
          'inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-medium transition',
          exporting || svgTooBig
            ? 'cursor-not-allowed bg-card/40 text-muted-foreground'
            : 'bg-foreground text-background hover:bg-foreground/90',
        )}
      >
        {exporting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span className="capitalize">{progress?.stage ?? 'working'}…</span>
            {progress?.detail && (
              <span className="readout opacity-80">· {progress.detail}</span>
            )}
          </>
        ) : (
          <>
            <Download size={14} />
            Export {format.toUpperCase()}
          </>
        )}
      </button>

      {progress && exporting && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-card/30" role="progressbar" aria-valuenow={progress.percent ?? 0} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${progress.percent ?? 0}%` }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
