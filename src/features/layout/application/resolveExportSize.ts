import { findLayout, LAYOUTS } from '@/data/layouts'
import { exportSize, physicalInches, type Layout } from '@/features/layout/domain/Layout'
import type { LayoutSelection } from '@/features/poster/domain/PosterState'

export interface ResolvedExportSize {
  widthPx: number
  heightPx: number
  /** Physical size the PDF page / PNG pHYs chunk should advertise. */
  physicalWidthIn: number
  physicalHeightIn: number
  megapixels: number
  /** The preset behind the selection, if any. */
  layout: Layout | null
}

const FALLBACK_LAYOUT_ID = 'a4-portrait'

/** Single source of truth for "how big is the export" across UI and pipeline. */
export function resolveExportSize(selection: LayoutSelection): ResolvedExportSize {
  const dpi = selection.dpi
  if (selection.kind === 'preset') {
    const layout = findLayout(selection.presetId) ?? findLayout(FALLBACK_LAYOUT_ID) ?? LAYOUTS[0]
    if (!layout) throw new Error('no layouts defined')
    const { widthPx, heightPx } = exportSize(layout, dpi)
    const phys = physicalInches(layout)
    return {
      widthPx,
      heightPx,
      physicalWidthIn: phys ? phys.w : widthPx / dpi,
      physicalHeightIn: phys ? phys.h : heightPx / dpi,
      megapixels: (widthPx * heightPx) / 1_000_000,
      layout,
    }
  }
  return {
    widthPx: selection.widthPx,
    heightPx: selection.heightPx,
    physicalWidthIn: selection.widthPx / dpi,
    physicalHeightIn: selection.heightPx / dpi,
    megapixels: (selection.widthPx * selection.heightPx) / 1_000_000,
    layout: null,
  }
}
