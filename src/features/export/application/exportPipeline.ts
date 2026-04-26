import { findLayout, LAYOUTS } from '@/data/layouts'
import { exportSize } from '@/features/layout/domain/Layout'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { buildMapStyle } from '@/features/theme/application/mapStyleSpec'
import type { ExportFormat, PosterState } from '@/features/poster/domain/PosterState'
import { renderSinglePass } from '@/features/export/application/singlePass'
import { compositeOverlay } from '@/features/export/application/compositeOverlay'
import { encodePng } from '@/features/export/infrastructure/png/encodePng'
import { encodePdf } from '@/features/export/infrastructure/pdf/encodePdf'
import { encodeSvg } from '@/features/export/infrastructure/svg/encodeSvg'
import { downloadBlob } from '@/shared/utils/downloadBlob'
import { services } from '@/core/services'
import { renderTiled } from '@/features/export/application/tileRender'

export const SINGLE_PASS_MAX_SIDE = 8192
export const TILED_MAX_SIDE = 16384
export const TILED_MAX_PIXELS = 256_000_000

export interface ExportRequest {
  state: PosterState
  format: ExportFormat
  /** Live viewport width (used to compute the export zoom). */
  liveViewportWidth: number
  liveViewportHeight: number
}

export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'compositing' | 'encoding' | 'downloading' | 'done'
  detail?: string
  percent?: number
}

export type ProgressCb = (p: ExportProgress) => void

interface ResolvedSize {
  widthPx: number
  heightPx: number
  physicalWidthIn: number
  physicalHeightIn: number
}

function resolveSize(state: PosterState): ResolvedSize {
  const dpi = state.layout.dpi
  if (state.layout.kind === 'preset') {
    const layout = findLayout(state.layout.presetId) ?? LAYOUTS[3]
    if (!layout) throw new Error('layout not found')
    const { widthPx, heightPx } = exportSize(layout, dpi)
    if (layout.physical) {
      const w = layout.physical.unit === 'in' ? layout.physical.w : layout.physical.w / 25.4
      const h = layout.physical.unit === 'in' ? layout.physical.h : layout.physical.h / 25.4
      return { widthPx, heightPx, physicalWidthIn: w, physicalHeightIn: h }
    }
    return {
      widthPx,
      heightPx,
      physicalWidthIn: widthPx / dpi,
      physicalHeightIn: heightPx / dpi,
    }
  }
  return {
    widthPx: state.layout.widthPx,
    heightPx: state.layout.heightPx,
    physicalWidthIn: state.layout.widthPx / dpi,
    physicalHeightIn: state.layout.heightPx / dpi,
  }
}

function fileNameFor(state: PosterState, format: ExportFormat, size: ResolvedSize): string {
  const city =
    (state.title.cityLabel ?? state.title.city ?? 'poster')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'poster'
  const dim = `${size.widthPx}x${size.heightPx}`
  return `maptoposter-${city}-${dim}.${format === 'pdf' ? 'pdf' : format === 'svg' ? 'svg' : 'png'}`
}

export async function runExport(
  req: ExportRequest,
  onProgress: ProgressCb = () => undefined,
): Promise<void> {
  const { state, format } = req
  onProgress({ stage: 'preparing', percent: 5 })

  const size = resolveSize(state)
  if (Math.max(size.widthPx, size.heightPx) > TILED_MAX_SIDE) {
    throw new Error(
      `Export size ${size.widthPx}×${size.heightPx} exceeds maximum ${TILED_MAX_SIDE}px on the long side.`,
    )
  }
  if (size.widthPx * size.heightPx > TILED_MAX_PIXELS) {
    throw new Error(
      `Export size ${size.widthPx}×${size.heightPx} exceeds maximum total ${TILED_MAX_PIXELS / 1_000_000}MP.`,
    )
  }

  // Pre-load the title-block font.
  const fontDef = (await import('@/data/fonts')).findFont(state.font.id)
  if (fontDef) {
    await services.fonts.ensureLoaded(fontDef.id, state.font.weight).catch(() => undefined)
  }

  // Build the resolved style.
  const fallbackTheme = THEMES[0]
  if (!fallbackTheme) throw new Error('no themes')
  const theme = findTheme(state.theme.id) ?? fallbackTheme
  const colors = resolveTheme(theme, state.theme.overrides)
  const styleSpec = buildMapStyle({
    colors,
    layers: state.layers,
    tilesBaseUrl: services.config.tilesBaseUrl,
  })

  // Compute the zoom for the offscreen render so the geographic content
  // matches what the live preview shows. We assume the export aspect ratio
  // matches the preview frame's aspect (the layout picker enforces this).
  const exportAspect = size.widthPx / size.heightPx
  const livePxRef = exportAspect >= 1 ? req.liveViewportWidth : req.liveViewportHeight
  const exportPxRef = exportAspect >= 1 ? size.widthPx : size.heightPx
  const exportZoom = state.view.zoom + Math.log2(exportPxRef / Math.max(1, livePxRef))

  onProgress({ stage: 'rendering', percent: 15 })

  const useTiled = Math.max(size.widthPx, size.heightPx) > SINGLE_PASS_MAX_SIDE
  const result = useTiled
    ? await renderTiled({
        styleSpec,
        view: state.view,
        widthPx: size.widthPx,
        heightPx: size.heightPx,
        exportZoom,
        onTileProgress: (done, total) =>
          onProgress({
            stage: 'rendering',
            percent: 15 + Math.round((done / total) * 60),
            detail: `tile ${done}/${total}`,
          }),
      })
    : await renderSinglePass({
        styleSpec,
        view: state.view,
        widthPx: size.widthPx,
        heightPx: size.heightPx,
        exportZoom,
      })

  onProgress({ stage: 'compositing', percent: 80 })

  await compositeOverlay({
    canvas: result.canvas,
    proj: {
      centerLat: result.centerLat,
      centerLon: result.centerLon,
      zoom: result.effectiveZoom,
      exportWidthPx: size.widthPx,
      exportHeightPx: size.heightPx,
    },
    state,
    themeColors: colors,
  })

  onProgress({ stage: 'encoding', percent: 90 })

  let blob: Blob
  if (format === 'png') {
    blob = await encodePng(result.canvas, state.layout.dpi)
  } else if (format === 'pdf') {
    blob = await encodePdf({
      canvas: result.canvas,
      widthIn: size.physicalWidthIn,
      heightIn: size.physicalHeightIn,
      quality: 0.92,
    })
  } else {
    blob = await encodeSvg(result.canvas)
  }

  onProgress({ stage: 'downloading', percent: 98 })
  downloadBlob(blob, fileNameFor(state, format, size))
  onProgress({ stage: 'done', percent: 100 })
}
