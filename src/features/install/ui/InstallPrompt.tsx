import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/features/install/application/useInstallPrompt'

export function InstallPrompt() {
  const { canInstall, install, snooze } = useInstallPrompt()
  if (!canInstall) return null
  return (
    <div className="pointer-events-auto absolute bottom-20 left-3 z-30 max-w-[320px]">
      <div className="glass flex items-start gap-3 rounded-md p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--brass)]/15 text-[var(--brass)]">
          <Download size={16} />
        </div>
        <div className="flex-1">
          <div className="readout text-[10.5px] uppercase tracking-[0.18em] text-foreground/90">
            Install maptoposter
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Run as a standalone app · cached tiles work offline.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded px-2 py-1 text-[10.5px] uppercase tracking-[0.18em]"
              style={{ background: 'var(--brass)', color: 'oklch(0.18 0.02 60)' }}
            >
              Install
            </button>
            <button
              type="button"
              onClick={snooze}
              className="rounded px-2 py-1 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={snooze}
          aria-label="Dismiss"
          className="rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
