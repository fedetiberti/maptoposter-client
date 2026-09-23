import { Download, Loader2, X } from 'lucide-react'
import { useDock } from '@/features/dock/application/DockContext'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { useExportRunner } from '@/features/export/application/ExportRunnerContext'
import { resolveExportSize } from '@/features/layout/application/resolveExportSize'

/**
 * Bottom-right floating action button.
 * Single-tap exports in the user's last-chosen format.
 * Right-click opens the full Export panel in the dock.
 */
export function ExportFAB() {
  const state = usePosterState()
  const { open } = useDock()
  const { exporting, progress, error, start, dismissError } = useExportRunner()

  const size = resolveExportSize(state.layout)
  const stage = progress?.stage
  const percent = progress?.percent ?? 0

  return (
    <div className="pointer-events-auto absolute bottom-28 right-3 z-30 flex flex-col items-end gap-1.5 sm:bottom-20">
      {(exporting || error) && (
        <div className="glass min-w-[220px] max-w-[320px] rounded-md px-3 py-2" role="status">
          {error ? (
            <div className="flex items-start gap-2">
              <span className="flex-1 text-[11px] text-destructive">{error}</span>
              <button
                type="button"
                onClick={dismissError}
                aria-label="Dismiss"
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            </div>
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
        onClick={start}
        onContextMenu={(e) => {
          e.preventDefault()
          open('export')
        }}
        title={`Export as ${state.exportSettings.format.toUpperCase()} — ${size.widthPx}×${size.heightPx} (${size.megapixels.toFixed(
          1,
        )} MP @ ${state.layout.dpi} DPI). Right-click for options.`}
        className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-wait"
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
