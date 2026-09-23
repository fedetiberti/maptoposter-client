/* eslint-disable react-refresh/only-export-components -- provider + hook share a file by design */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { useFramePresentation } from '@/features/poster/application/FramePresentationContext'
import { runExport, type ExportProgress } from '@/features/export/application/exportPipeline'

interface ExportRunner {
  exporting: boolean
  progress: ExportProgress | null
  error: string | null
  /** Kick off an export in the current format. No-op while one is running. */
  start: () => Promise<void>
  dismissError: () => void
}

const Ctx = createContext<ExportRunner | null>(null)

/**
 * One export at a time, shared by the floating button and the Export panel so
 * they can't race each other and always show the same progress.
 */
export function ExportRunnerProvider({ children }: { children: ReactNode }) {
  const state = usePosterState()
  const { viewportSize, previewBox } = useFramePresentation()
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const runningRef = useRef(false)
  const clearTimerRef = useRef<number | null>(null)

  const start = useCallback(async () => {
    if (runningRef.current) return
    setError(null)
    if (!viewportSize || !previewBox) {
      setError('Preview not ready — try again in a moment.')
      return
    }
    runningRef.current = true
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current)
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
      runningRef.current = false
      setExporting(false)
      clearTimerRef.current = window.setTimeout(() => setProgress(null), 1500)
    }
  }, [state, viewportSize, previewBox])

  const value = useMemo<ExportRunner>(
    () => ({ exporting, progress, error, start, dismissError: () => setError(null) }),
    [exporting, progress, error, start],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useExportRunner(): ExportRunner {
  const v = useContext(Ctx)
  if (!v) throw new Error('useExportRunner must be used inside <ExportRunnerProvider>')
  return v
}
