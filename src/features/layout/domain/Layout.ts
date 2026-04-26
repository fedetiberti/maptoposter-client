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

/** Compute the export pixel size given a layout and a chosen DPI. */
export function exportSize(layout: Layout, chosenDpi: number): {
  widthPx: number
  heightPx: number
} {
  const scale = chosenDpi / layout.baseDpi
  return {
    widthPx: Math.round(layout.widthPx * scale),
    heightPx: Math.round(layout.heightPx * scale),
  }
}

export function aspectRatio(layout: Layout): number {
  return layout.widthPx / layout.heightPx
}

export function formatLayoutSize(layout: Layout, dpi: number): string {
  const { widthPx, heightPx } = exportSize(layout, dpi)
  if (layout.physical) {
    const { w, h, unit } = layout.physical
    return `${widthPx}×${heightPx} px · ${w}×${h} ${unit} @ ${dpi} DPI`
  }
  return `${widthPx}×${heightPx} px`
}
