import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useDock } from '@/features/dock/application/DockContext'
import {
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { useFramePresentation } from '@/features/poster/application/FramePresentationContext'
import { runExport, type ExportProgress } from '@/features/export/application/exportPipeline'
import { findLayout, LAYOUTS } from '@/data/layouts'
import { exportSize } from '@/features/layout/domain/Layout'

/**
 * Bottom-right floating action button.
 * Single-tap exports in the user's last-chosen format.
 * Long-press / right-click opens the full Export panel in the dock.
 */
export function ExportFAB() {
  const state = usePosterState()
  const { open } = useDock()
  const { viewportSize, previewBox } = useFramePresentation()
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dpi = state.layout.dpi
  const layout =
    state.layout.kind === 'preset' ? findLayout(state.layout.presetId) ?? LAYOUTS[3] : null
  let widthPx = 0
  let heightPx = 0
  if (layout) {
    const s = exportSize(layout, dpi)
    widthPx = s.widthPx
    heightPx = s.heightPx
  } else if (state.layout.kind === 'custom') {
    widthPx = state.layout.widthPx
    heightPx = state.layout.heightPx
  }
  const mp = (widthPx * heightPx) / 1_000_000

  async function quickExport(): Promise<void> {
    setError(null)
    if (!viewportSize || !previewBox) {
      setError('Preview not ready — try again in a moment.')
      return
    }
    setExporting(true)
    setProgress({ stage: 'preparing', percent: 0 })
    try {
      await runExport(
        {
          state,
          format: state.exportSettings.format,
          liveViewportWidth: viewportSize.width,
          liveViewportHeight: viewportSize.height,
          previewBox,
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

  const stage = progress?.stage
  const percent = progress?.percent ?? 0

  return (
    <div className="pointer-events-auto absolute bottom-16 right-3 z-30 flex flex-col items-end gap-1.5">
      {(exporting || error) && (
        <div className="glass min-w-[220px] rounded-md px-3 py-2">
          {error ? (
            <span className="text-[11px] text-destructive">{error}</span>
          ) : (
            <>
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>{stage ?? 'working'}</span>
                <span className="readout text-foreground/80">{percent}%</span>
              </div>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full transition-[width]"
                  style={{ width: `${percent}%`, background: 'var(--brass)' }}
                />
              </div>
              {progress?.detail && (
                <div className="readout mt-1 text-[10px] text-muted-foreground/70">
                  {progress.detail}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={exporting}
        onClick={quickExport}
        onContextMenu={(e) => {
          e.preventDefault()
          open('export')
        }}
        title={`Export as ${state.exportSettings.format.toUpperCase()} — ${widthPx}×${heightPx} (${mp.toFixed(
          1,
        )} MP @ ${dpi} DPI). Right-click for options.`}
        className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium transition disabled:cursor-wait"
        style={{
          background:
            'linear-gradient(180deg, oklch(0.86 0.16 75) 0%, oklch(0.78 0.16 70) 100%)',
          color: 'oklch(0.18 0.02 60)',
          boxShadow:
            '0 1px 0 0 oklch(1 0 0 / 30%) inset, 0 16px 32px -8px oklch(0.83 0.16 75 / 35%), 0 0 0 1px oklch(0 0 0 / 30%)',
        }}
      >
        {exporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} strokeWidth={2.2} />
        )}
        <span className="uppercase tracking-[0.22em]">
          Export {state.exportSettings.format}
        </span>
      </button>
    </div>
  )
}
