import { findLayout, LAYOUTS } from '@/data/layouts'
import { exportSize } from '@/features/layout/domain/Layout'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { buildMapStyle } from '@/features/theme/application/mapStyleSpec'
import type { ExportFormat, PosterState, MapView } from '@/features/poster/domain/PosterState'
import { renderSinglePass } from '@/features/export/application/singlePass'
import { compositeOverlay } from '@/features/export/application/compositeOverlay'
import { encodePng } from '@/features/export/infrastructure/png/encodePng'
import { encodePdf } from '@/features/export/infrastructure/pdf/encodePdf'
import { encodeSvg } from '@/features/export/infrastructure/svg/encodeSvg'
import { downloadBlob } from '@/shared/utils/downloadBlob'
import { services } from '@/core/services'
import { renderTiled } from '@/features/export/application/tileRender'
import type { PreviewBox } from '@/features/layout/application/computePreviewBox'
import {
  lonLatToWorldPx,
  worldPxToLonLat,
} from '@/features/export/application/projection'

export const SINGLE_PASS_MAX_SIDE = 8192
export const TILED_MAX_SIDE = 16384
export const TILED_MAX_PIXELS = 256_000_000

export interface ExportRequest {
  state: PosterState
  format: ExportFormat
  /** Live viewport width (used to compute the offset of the frame center). */
  liveViewportWidth: number
  liveViewportHeight: number
  /** The exact frame rect the user is looking at, measured by PosterFrame. */
  previewBox: PreviewBox
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
  await services.fonts.ensureLoaded(state.font.id, state.font.weight).catch(() => undefined)

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

  // Match exactly what the live preview's poster frame shows.
  //
  // The right-edge dock pushes the frame off-center horizontally, so the
  // geographic point at the frame's center is NOT state.view.lat/lon (which
  // tracks the window center). Compute the frame's geographic center by
  // projecting the on-screen pixel offset through web mercator at the
  // current zoom. Then choose an exportZoom such that the export's pixel
  // box covers the same geographic extent as the frame's pixel box.
  //
  // We use the previewBox the PosterFrame component actually rendered with,
  // not a recomputed one — this keeps preview and export in lockstep even if
  // the frame's measured size diverges from window.innerWidth/Height.
  const exportView = computeFrameProjection({
    state,
    viewportWidth: req.liveViewportWidth,
    viewportHeight: req.liveViewportHeight,
    previewBox: req.previewBox,
    exportWidthPx: size.widthPx,
    exportHeightPx: size.heightPx,
  })

  onProgress({ stage: 'rendering', percent: 15 })

  const useTiled = Math.max(size.widthPx, size.heightPx) > SINGLE_PASS_MAX_SIDE
  const result = useTiled
    ? await renderTiled({
        styleSpec,
        view: exportView.view,
        widthPx: size.widthPx,
        heightPx: size.heightPx,
        exportZoom: exportView.zoom,
        onTileProgress: (done, total) =>
          onProgress({
            stage: 'rendering',
            percent: 15 + Math.round((done / total) * 60),
            detail: `tile ${done}/${total}`,
          }),
      })
    : await renderSinglePass({
        styleSpec,
        view: exportView.view,
        widthPx: size.widthPx,
        heightPx: size.heightPx,
        exportZoom: exportView.zoom,
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

interface FrameProjectionInput {
  state: PosterState
  viewportWidth: number
  viewportHeight: number
  previewBox: PreviewBox
  exportWidthPx: number
  exportHeightPx: number
}

/**
 * Pure function: derives the geographic center + zoom that makes the export
 * canvas show the same content as the live preview frame.
 */
function computeFrameProjection(input: FrameProjectionInput): {
  view: MapView
  zoom: number
} {
  const { previewBox } = input
  // Frame center (in screen pixels) and its offset from the window center.
  const frameCenterX = previewBox.x + previewBox.width / 2
  const frameCenterY = previewBox.y + previewBox.height / 2
  const offsetX = frameCenterX - input.viewportWidth / 2
  const offsetY = frameCenterY - input.viewportHeight / 2

  // At the current zoom, 1 world-px = 1 screen-px, so the offset translates
  // directly into a world-pixel shift. Convert back to lon/lat.
  const stateView = input.state.view
  const stateWorld = lonLatToWorldPx(stateView.lon, stateView.lat, stateView.zoom)
  const frameWorld = {
    x: stateWorld.x + offsetX,
    y: stateWorld.y + offsetY,
  }
  const frameLonLat = worldPxToLonLat(frameWorld.x, frameWorld.y, stateView.zoom)

  // Zoom that makes the export pixel box cover the same geographic extent
  // as the preview pixel box. Pick the dimension that constrains scale on
  // both axes equally (aspect ratios match by construction, so either works).
  const exportAspect = input.exportWidthPx / input.exportHeightPx
  const exportPxRef = exportAspect >= 1 ? input.exportWidthPx : input.exportHeightPx
  const previewPxRef = exportAspect >= 1 ? previewBox.width : previewBox.height
  const zoom =
    stateView.zoom + Math.log2(exportPxRef / Math.max(1, previewPxRef))

  return {
    view: {
      ...stateView,
      lat: frameLonLat.lat,
      lon: frameLonLat.lon,
    },
    zoom,
  }
}
