import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

/**
 * Service-worker update prompt. Lazy-imports the registerSW helper so this
 * file is safe to bundle even when virtual:pwa-register isn't available
 * (e.g., dev mode without the PWA plugin).
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import(/* @vite-ignore */ 'virtual:pwa-register')
        if (cancelled) return
        const fn = mod.registerSW({
          immediate: true,
          onNeedRefresh() {
            if (!cancelled) setNeedRefresh(true)
          },
        }) as (reload?: boolean) => Promise<void>
        setUpdateSW(() => fn)
      } catch {
        // Plugin not active; ignore.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!needRefresh || !updateSW) return null
  return (
    <div className="pointer-events-auto absolute bottom-20 left-3 z-30 max-w-[320px]">
      <div className="glass flex items-start gap-3 rounded-md p-3">
        <RefreshCw size={16} className="mt-0.5 text-[var(--brass)]" />
        <div className="flex-1">
          <div className="readout text-[10.5px] uppercase tracking-[0.18em] text-foreground/90">
            Update available
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            A newer version of maptoposter is ready. Reload to apply.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSW(true)}
              className="rounded px-2 py-1 text-[10.5px] uppercase tracking-[0.18em]"
              style={{ background: 'var(--brass)', color: 'oklch(0.18 0.02 60)' }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="rounded px-2 py-1 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Later
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss"
          className="rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
