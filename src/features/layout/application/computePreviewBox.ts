/**
 * Fits a layout's aspect ratio into the viewport with a configurable margin,
 * returning the on-screen rect of the poster preview frame.
 *
 * Constants are shared with PosterFrame.tsx and exportPipeline.ts so that
 * (live preview frame) and (export geographic content) stay in sync.
 */
export const POSTER_MARGIN_PX = 56
export const POSTER_RIGHT_DOCK_PX = 380

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

export function computePreviewBox(
  viewport: ViewportRect,
  aspectRatio: number,
  options: { marginPx?: number; rightDockPx?: number } = {},
): PreviewBox {
  const margin = options.marginPx ?? 64
  const rightDock = options.rightDockPx ?? 0
  const availableW = Math.max(40, viewport.width - rightDock - margin * 2)
  const availableH = Math.max(40, viewport.height - margin * 2)

  const fitByWidth = { w: availableW, h: availableW / aspectRatio }
  const fitByHeight = { w: availableH * aspectRatio, h: availableH }
  const fit = fitByWidth.h <= availableH ? fitByWidth : fitByHeight

  const x = margin + (availableW - fit.w) / 2
  const y = margin + (availableH - fit.h) / 2
  return { x, y, width: fit.w, height: fit.h }
}
