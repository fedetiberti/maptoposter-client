import { lonLatToExportPx, type ExportProjection } from '@/features/export/application/projection'
import {
  computeTitleFontSizes,
  formatCoords,
  resolveTitleWeights,
  TITLE_BLOCK,
} from '@/features/poster/domain/textLayout'
import { tintSvg } from '@/features/markers/application/tintSvg'
import { iconRegistry } from '@/features/markers/infrastructure/IconRegistry'
import type {
  GpxState,
  Marker,
  PosterState,
} from '@/features/poster/domain/PosterState'
import type { ThemeColors } from '@/features/theme/domain/Theme'
import { findFont } from '@/data/fonts'
import { hexToRgb } from '@/shared/utils/color'
import { gpxLineWidthAtZoom } from '@/features/gpx/domain/gpxStyle'

interface CompositeOpts {
  canvas: HTMLCanvasElement
  proj: ExportProjection
  state: PosterState
  themeColors: ThemeColors
  /**
   * Export px per on-screen preview px. Markers and the GPX stroke are sized
   * in screen pixels in the live preview; multiplying by this keeps them the
   * same size *relative to the poster* in the export.
   */
  previewScale: number
}

function rgbaWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Draw text + markers + GPX overlay onto an already-painted 2D canvas. Runs at
 * full export resolution so antialiasing and font rendering are crisp.
 */
export async function compositeOverlay({
  canvas,
  proj,
  state,
  themeColors,
  previewScale,
}: CompositeOpts): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  const { width: W, height: H } = canvas

  // ── 1. GPX line ────────────────────────────────────────────────────────
  if (state.gpx) {
    drawGpx(ctx, state.gpx, proj, themeColors, state.view.zoom, previewScale)
  }

  // ── 2. Markers ─────────────────────────────────────────────────────────
  for (const m of state.markers) {
    await drawMarker(ctx, m, proj, previewScale)
  }

  // ── 3. Top + bottom gradient fades ─────────────────────────────────────
  // Mirrors the original maptoposter behavior: map shows through edge-to-edge,
  // fades into theme bg so the title block (and a subtle top strip) reads cleanly.
  drawFades(ctx, themeColors['ui.bg'], W, H, state.fadePercent)

  // ── 4. Title block text ────────────────────────────────────────────────
  drawTitleBlock(ctx, state, themeColors, proj, W, H)
}

function drawFades(
  ctx: CanvasRenderingContext2D,
  bgHex: string,
  W: number,
  H: number,
  fadePercent: number,
): void {
  // Bands of `fadePercent` height at top and bottom, pure linear alpha ramp
  // (1 at the edge → 0 at the inner edge) in the theme bg color. Same
  // geometry as the CSS gradients in PosterFrame.
  if (fadePercent <= 0) return
  const bandH = Math.round((H * fadePercent) / 100)
  if (bandH <= 0) return
  const topH = bandH
  const topGrad = ctx.createLinearGradient(0, 0, 0, topH)
  topGrad.addColorStop(0, bgHex)
  topGrad.addColorStop(1, rgbaWithAlpha(bgHex, 0))
  ctx.save()
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, topH)
  ctx.restore()

  const botH = bandH
  const botStartY = H - botH
  const botGrad = ctx.createLinearGradient(0, botStartY, 0, H)
  botGrad.addColorStop(0, rgbaWithAlpha(bgHex, 0))
  botGrad.addColorStop(1, bgHex)
  ctx.save()
  ctx.fillStyle = botGrad
  ctx.fillRect(0, botStartY, W, botH)
  ctx.restore()
}

function drawGpx(
  ctx: CanvasRenderingContext2D,
  gpx: GpxState,
  proj: ExportProjection,
  colors: ThemeColors,
  liveZoom: number,
  previewScale: number,
): void {
  if (gpx.geoJson.coordinates.length < 2) return
  ctx.save()
  ctx.strokeStyle = gpx.color ?? colors['ui.text']
  ctx.lineWidth = Math.max(1, gpxLineWidthAtZoom(liveZoom) * previewScale)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.95
  ctx.beginPath()
  let started = false
  for (const c of gpx.geoJson.coordinates) {
    if (!c) continue
    const lon = c[0]
    const lat = c[1]
    if (typeof lon !== 'number' || typeof lat !== 'number') continue
    const p = lonLatToExportPx(proj, lon, lat)
    if (!started) {
      ctx.moveTo(p.x, p.y)
      started = true
    } else {
      ctx.lineTo(p.x, p.y)
    }
  }
  ctx.stroke()
  ctx.restore()
}

async function drawMarker(
  ctx: CanvasRenderingContext2D,
  m: Marker,
  proj: ExportProjection,
  previewScale: number,
): Promise<void> {
  const icon = iconRegistry.find(m.iconId) ?? iconRegistry.list()[0]
  if (!icon) return
  const exportSize = Math.max(1, Math.round(m.sizePx * previewScale))
  const { canvas: tintedCanvas } = await tintSvg(icon.svg, m.color, exportSize, 1)
  const p = lonLatToExportPx(proj, m.lon, m.lat)
  // Anchor at bottom (pin tip points to coord) — same as the live MapLibre marker.
  ctx.drawImage(tintedCanvas, p.x - exportSize / 2, p.y - exportSize, exportSize, exportSize)
}

function drawTitleBlock(
  ctx: CanvasRenderingContext2D,
  state: PosterState,
  colors: ThemeColors,
  proj: ExportProjection,
  W: number,
  H: number,
): void {
  const city = (state.title.cityLabel ?? state.title.city ?? '').toUpperCase()
  const country = (state.title.countryLabel ?? state.title.country ?? '').toUpperCase()
  const fontSizes = computeTitleFontSizes(W, H, city.length)
  const fontDef = findFont(state.font.id)
  const cssFamily = fontDef?.cssFamily ?? state.font.googleFamily ?? 'Inter Variable'
  const familyChain = `"${cssFamily}", system-ui, sans-serif`
  const weights = resolveTitleWeights(fontDef?.weights ?? [state.font.weight], state.font.weight)

  ctx.save()
  ctx.fillStyle = colors['ui.text']
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  type CtxWithLetterSpacing = CanvasRenderingContext2D & { letterSpacing?: string }
  const spaced = ctx as CtxWithLetterSpacing

  // City — bold, big, wide letter-spacing. Canvas letter-spacing adds the gap
  // after every glyph including the last, so nudge by half a gap to keep the
  // visible ink centred (CSS letter-spacing in the preview behaves the same).
  if (city) {
    const gap = TITLE_BLOCK.cityLetterSpacingEm * fontSizes.city
    ctx.font = `${weights.city} ${fontSizes.city}px ${familyChain}`
    spaced.letterSpacing = `${gap}px`
    ctx.fillText(city, W / 2 + gap / 2, H * TITLE_BLOCK.cityYRatio)
  }

  // Divider — thin horizontal line
  const dividerY = H * TITLE_BLOCK.dividerYRatio
  ctx.strokeStyle = colors['ui.text']
  ctx.lineWidth = fontSizes.divider.strokePx
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.moveTo(W / 2 - fontSizes.divider.widthPx / 2, dividerY)
  ctx.lineTo(W / 2 + fontSizes.divider.widthPx / 2, dividerY)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Country
  if (country) {
    const gap = TITLE_BLOCK.countryLetterSpacingEm * fontSizes.country
    ctx.font = `${weights.country} ${fontSizes.country}px ${familyChain}`
    spaced.letterSpacing = `${gap}px`
    ctx.globalAlpha = 0.85
    ctx.fillText(country, W / 2 + gap / 2, H * TITLE_BLOCK.countryYRatio)
  }

  // Coords — of the poster centre, which is what the export actually shows.
  if (state.title.showCoordinates) {
    const gap = TITLE_BLOCK.coordsLetterSpacingEm * fontSizes.coords
    ctx.font = `${weights.coords} ${fontSizes.coords}px ${familyChain}`
    spaced.letterSpacing = `${gap}px`
    ctx.globalAlpha = 0.6
    ctx.fillText(
      formatCoords(proj.centerLat, proj.centerLon),
      W / 2 + gap / 2,
      H * TITLE_BLOCK.coordsYRatio,
    )
  }

  ctx.restore()
}
