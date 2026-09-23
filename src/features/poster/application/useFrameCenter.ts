import { useMemo } from 'react'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { useFramePresentation } from '@/features/poster/application/FramePresentationContext'
import { screenOffsetToLonLat } from '@/features/export/application/projection'

/**
 * The geographic point under the centre of the poster frame.
 *
 * `state.view` tracks the *window* centre; the right-hand dock pushes the
 * frame off-centre, so anything that prints "the poster's coordinates" (title
 * block, status bar, export) must go through this instead.
 */
export function useFrameCenter(): { lat: number; lon: number } {
  const { view } = usePosterState()
  const { viewportSize, previewBox } = useFramePresentation()
  return useMemo(() => {
    if (!viewportSize || !previewBox) return { lat: view.lat, lon: view.lon }
    const dx = previewBox.x + previewBox.width / 2 - viewportSize.width / 2
    const dy = previewBox.y + previewBox.height / 2 - viewportSize.height / 2
    return screenOffsetToLonLat(view, dx, dy)
  }, [view, viewportSize, previewBox])
}
