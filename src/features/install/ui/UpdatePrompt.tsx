import { useEffect, useRef, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { registerSW } from 'virtual:pwa-register'

/**
 * Service-worker update prompt. `virtual:pwa-register` is provided by
 * vite-plugin-pwa in both dev (no-op) and production builds, so it must be a
 * static import — a dynamic `import('virtual:…')` survives into the bundle
 * and the browser then tries to fetch that literal URL.
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    let cancelled = false
    try {
      updateRef.current = registerSW({
        immediate: true,
        onNeedRefresh() {
          if (!cancelled) setNeedRefresh(true)
        },
      })
    } catch {
      // Service workers unavailable (e.g. insecure context); ignore.
    }
    return () => {
      cancelled = true
    }
  }, [])

  if (!needRefresh) return null
  return (
    <div className="pointer-events-auto absolute bottom-20 left-3 z-30 max-w-[320px]">
      <div className="glass flex items-start gap-3 rounded-md p-3" role="status">
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
              onClick={() => updateRef.current?.(true)}
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
