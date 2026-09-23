/**
 * Fits a layout's aspect ratio into the viewport with a configurable margin,
 * returning the on-screen rect of the poster preview frame.
 *
 * PosterFrame.tsx measures with these numbers and publishes the resulting box
 * through FramePresentationContext; the export pipeline reads that published
 * box, so (live preview frame) and (export geographic content) stay in sync.
 */
export const POSTER_MARGIN_PX = 56
export const POSTER_RIGHT_DOCK_PX = 380

/** Below this width the dock panel overlays the map instead of reserving space. */
export const COMPACT_BREAKPOINT_PX = 900
const COMPACT_MARGIN_PX = 16
const COMPACT_RAIL_PX = 64
/** Vertical inset for the top-left brand chip and the bottom status bar. */
const COMPACT_TOP_PX = 48
const COMPACT_BOTTOM_PX = 64

export interface ViewportRect {
  width: number
  height: number
}

export interface PreviewBox {
  /** Pixel rect of the poster frame within the viewport (origin top-left). */
  x: number
  y: number
  width: number
  height: number
}

export interface FrameInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Space reserved around the poster frame for chrome (dock, status bar…).
 * Wide viewports keep a fixed slot for the dock so the frame doesn't jump when
 * a panel opens; compact ones only reserve the icon rail.
 */
export function frameInsetsFor(viewport: ViewportRect): FrameInsets {
  if (viewport.width < COMPACT_BREAKPOINT_PX) {
    return {
      top: COMPACT_TOP_PX,
      right: COMPACT_RAIL_PX + COMPACT_MARGIN_PX,
      bottom: COMPACT_BOTTOM_PX,
      left: COMPACT_MARGIN_PX,
    }
  }
  return {
    top: POSTER_MARGIN_PX,
    right: POSTER_RIGHT_DOCK_PX + POSTER_MARGIN_PX,
    bottom: POSTER_MARGIN_PX,
    left: POSTER_MARGIN_PX,
  }
}

export function computePreviewBox(
  viewport: ViewportRect,
  aspectRatio: number,
  insets: FrameInsets = frameInsetsFor(viewport),
): PreviewBox {
  const ratio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1
  const availableW = Math.max(40, viewport.width - insets.left - insets.right)
  const availableH = Math.max(40, viewport.height - insets.top - insets.bottom)

  const fitByWidth = { w: availableW, h: availableW / ratio }
  const fitByHeight = { w: availableH * ratio, h: availableH }
  const fit = fitByWidth.h <= availableH ? fitByWidth : fitByHeight

  const x = insets.left + (availableW - fit.w) / 2
  const y = insets.top + (availableH - fit.h) / 2
  return { x, y, width: fit.w, height: fit.h }
}
