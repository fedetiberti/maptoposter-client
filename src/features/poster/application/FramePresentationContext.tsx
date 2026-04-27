import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  PreviewBox,
  ViewportRect,
} from '@/features/layout/application/computePreviewBox'

interface FramePresentation {
  viewportSize: ViewportRect | null
  previewBox: PreviewBox | null
}

interface FramePresentationApi extends FramePresentation {
  set: (next: FramePresentation) => void
}

const Ctx = createContext<FramePresentationApi | null>(null)

export function FramePresentationProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<FramePresentation>({
    viewportSize: null,
    previewBox: null,
  })
  const value = useMemo<FramePresentationApi>(
    () => ({ ...s, set: setS }),
    [s],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFramePresentation(): FramePresentationApi {
  const v = useContext(Ctx)
  if (!v) {
    throw new Error('useFramePresentation must be used inside <FramePresentationProvider>')
  }
  return v
}
