import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { runExport, type ExportProgress } from '@/features/export/application/exportPipeline'
import type { ExportFormat } from '@/features/poster/domain/PosterState'
import { findLayout, LAYOUTS } from '@/data/layouts'
import { exportSize } from '@/features/layout/domain/Layout'
import { cn } from '@/lib/utils'

const FORMATS: readonly ExportFormat[] = ['png', 'pdf', 'svg']

export function ExportPanel() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const size = computeSize()

  function computeSize(): { w: number; h: number; mp: number } {
    const dpi = state.layout.dpi
    if (state.layout.kind === 'preset') {
      const layout = findLayout(state.layout.presetId) ?? LAYOUTS[3]
      if (!layout) return { w: 0, h: 0, mp: 0 }
      const s = exportSize(layout, dpi)
      return { w: s.widthPx, h: s.heightPx, mp: (s.widthPx * s.heightPx) / 1_000_000 }
    }
    return {
      w: state.layout.widthPx,
      h: state.layout.heightPx,
      mp: (state.layout.widthPx * state.layout.heightPx) / 1_000_000,
    }
  }

  async function doExport(): Promise<void> {
    setError(null)
    setExporting(true)
    setProgress({ stage: 'preparing', percent: 0 })
    try {
      await runExport(
        {
          state,
          format: state.exportSettings.format,
          liveViewportWidth: window.innerWidth,
          liveViewportHeight: window.innerHeight,
        },
        (p) => setProgress(p),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
      window.setTimeout(() => setProgress(null), 1500)
    }
  }

  const isLargeExport = size.mp > 70

  return (
    <div className="space-y-2 text-sm">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Export
      </h3>

      <div className="flex items-center gap-1 rounded-full bg-card/40 p-0.5">
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => dispatch({ type: 'SET_EXPORT', patch: { format: f } })}
            className={cn(
              'flex-1 rounded-full px-2 py-1 text-[11px] uppercase tracking-wider transition',
              state.exportSettings.format === f
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-md bg-card/30 px-2.5 py-1.5">
        <div className="font-mono text-[11px] text-muted-foreground">
          {size.w}×{size.h} px · {size.mp.toFixed(1)} MP @ {state.layout.dpi} DPI
        </div>
        {isLargeExport && (
          <div className="mt-1 text-[10px] text-amber-400/80">
            Large export — will use tile rendering (~1.5 GB peak RAM). Close other tabs.
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={exporting}
        onClick={doExport}
        className={cn(
          'inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-medium transition',
          exporting
            ? 'bg-card/40 text-muted-foreground'
            : 'bg-foreground text-background hover:bg-foreground/90',
        )}
      >
        {exporting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {progress?.stage === 'rendering' ? 'Rendering' : progress?.stage ?? 'Working'}…
            {progress?.detail && (
              <span className="font-mono opacity-80">· {progress.detail}</span>
            )}
          </>
        ) : (
          <>
            <Download size={14} />
            Export {state.exportSettings.format.toUpperCase()}
          </>
        )}
      </button>

      {progress && exporting && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-card/30">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${progress.percent ?? 0}%` }}
          />
        </div>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}
