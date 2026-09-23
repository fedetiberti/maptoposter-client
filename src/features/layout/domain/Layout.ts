export type LayoutCategory = 'print' | 'social' | 'wallpaper' | 'web'

export interface Layout {
  id: string
  name: string
  category: LayoutCategory
  /** Width in pixels at baseDpi. */
  widthPx: number
  heightPx: number
  /** DPI at which widthPx/heightPx are authored (300 for print, 72 for screen). */
  baseDpi: number
  /** Optional physical size for print layouts. */
  physical?: { w: number; h: number; unit: 'mm' | 'in' }
  description?: string
}

/** Whether the chosen DPI changes this layout's pixel size (print sizes only). */
export function isDpiScalable(layout: Layout): boolean {
  return layout.physical !== undefined
}

/**
 * Compute the export pixel size given a layout and a chosen DPI.
 *
 * Only layouts with a physical size scale with DPI — a 1080×1080 Instagram
 * post is a fixed pixel spec, so "300 DPI" must not turn it into 4500×4500.
 */
export function exportSize(layout: Layout, chosenDpi: number): {
  widthPx: number
  heightPx: number
} {
  if (!isDpiScalable(layout)) return { widthPx: layout.widthPx, heightPx: layout.heightPx }
  const scale = chosenDpi / layout.baseDpi
  return {
    widthPx: Math.round(layout.widthPx * scale),
    heightPx: Math.round(layout.heightPx * scale),
  }
}

export function aspectRatio(layout: Layout): number {
  return layout.widthPx / layout.heightPx
}

/** Physical size in inches, when the layout has one. */
export function physicalInches(layout: Layout): { w: number; h: number } | null {
  if (!layout.physical) return null
  const { w, h, unit } = layout.physical
  return unit === 'in' ? { w, h } : { w: w / 25.4, h: h / 25.4 }
}
