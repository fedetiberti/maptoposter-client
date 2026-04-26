import { useRef } from 'react'
import { findLayout, LAYOUTS } from '@/data/layouts'
import { aspectRatio } from '@/features/layout/domain/Layout'
import {
  computePreviewBox,
  POSTER_MARGIN_PX,
  POSTER_RIGHT_DOCK_PX,
} from '@/features/layout/application/computePreviewBox'
import { useResizeObserver } from '@/shared/hooks/useResizeObserver'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { TitleBlock } from '@/features/poster/ui/TitleBlock'

/**
 * Bordered, aspect-ratio'd preview overlay. Sits on top of the live MapLibre
 * canvas, clipping the visible map area to the poster shape and drawing the
 * title block within it.
 */
export function PosterFrame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const size = useResizeObserver(containerRef)
  const state = usePosterState()
  const fallbackLayout = LAYOUTS[3] // a4-portrait
  if (!fallbackLayout) return null
  const fallbackTheme = THEMES[0]
  if (!fallbackTheme) return null

  const layout =
    state.layout.kind === 'preset'
      ? findLayout(state.layout.presetId) ?? fallbackLayout
      : null
  const customRatio =
    state.layout.kind === 'custom'
      ? state.layout.widthPx / state.layout.heightPx
      : 0
  const ratio = layout ? aspectRatio(layout) : customRatio || 0.7071

  const theme = findTheme(state.theme.id) ?? fallbackTheme
  const colors = resolveTheme(theme, state.theme.overrides)

  const previewBox = size
    ? computePreviewBox(size, ratio, {
        marginPx: POSTER_MARGIN_PX,
        rightDockPx: POSTER_RIGHT_DOCK_PX,
      })
    : null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-label="Poster preview frame"
    >
      {previewBox && (
        <div
          className="absolute"
          style={{
            left: previewBox.x,
            top: previewBox.y,
            width: previewBox.width,
            height: previewBox.height,
            // Generous 4-side darkened backdrop to focus eye on the framed area.
            boxShadow:
              '0 0 0 9999px color-mix(in oklab, oklch(0 0 0) 64%, transparent), 0 30px 80px -10px rgba(0,0,0,0.6)',
            borderRadius: 4,
            border: `1px solid color-mix(in oklab, ${colors['ui.text']} 22%, transparent)`,
            outline: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent',
            overflow: 'hidden',
          }}
        >
          {/* Top + bottom gradient fades — let the map show through edge-to-edge,
              fading into the theme bg color so the title block stays readable. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: '12%',
              background: `linear-gradient(to bottom, ${colors['ui.bg']} 0%, transparent 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: '32%',
              background: `linear-gradient(to top, ${colors['ui.bg']} 0%, ${colors['ui.bg']} 28%, transparent 100%)`,
            }}
          />
          <TitleBlock width={previewBox.width} height={previewBox.height} />
        </div>
      )}
    </div>
  )
}
