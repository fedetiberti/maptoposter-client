import { lonLatToExportPx, type ExportProjection } from '@/features/export/application/projection'
import { computeTitleFontSizes, formatCoords } from '@/features/poster/domain/textLayout'
import { tintSvg } from '@/features/markers/application/tintSvg'
import { iconRegistry } from '@/features/markers/infrastructure/IconRegistry'
import type {
  Marker,
  PosterState,
} from '@/features/poster/domain/PosterState'
import type { ThemeColors } from '@/features/theme/domain/Theme'
import type { GpxState } from '@/features/poster/domain/PosterState'
import { findFont } from '@/data/fonts'

interface CompositeOpts {
  canvas: HTMLCanvasElement
  proj: ExportProjection
  state: PosterState
  themeColors: ThemeColors
  /** Height (in px) of the bottom title strip, derived from layout aspect. */
  titleStripHeightRatio?: number
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
  titleStripHeightRatio = 0.155,
}: CompositeOpts): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  const { width: W, height: H } = canvas

  // ── 1. GPX line ────────────────────────────────────────────────────────
  if (state.gpx) {
    drawGpx(ctx, state.gpx, proj, themeColors)
  }

  // ── 2. Markers ─────────────────────────────────────────────────────────
  for (const m of state.markers) {
    await drawMarker(ctx, m, proj)
  }

  // ── 3. Bottom title strip background ───────────────────────────────────
  const stripH = Math.round(H * titleStripHeightRatio)
  const stripY = H - stripH
  ctx.save()
  ctx.fillStyle = themeColors['ui.bg']
  ctx.fillRect(0, stripY, W, stripH)
  ctx.restore()

  // ── 4. Title block text ────────────────────────────────────────────────
  drawTitleBlock(ctx, state, themeColors, W, H)
}

function drawGpx(
  ctx: CanvasRenderingContext2D,
  gpx: GpxState,
  proj: ExportProjection,
  colors: ThemeColors,
): void {
  if (gpx.geoJson.coordinates.length < 2) return
  ctx.save()
  ctx.strokeStyle = gpx.color ?? colors['ui.text']
  ctx.lineWidth = Math.max(2, Math.round(proj.exportWidthPx / 700))
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
): Promise<void> {
  const icon = iconRegistry.find(m.iconId) ?? iconRegistry.list()[0]
  if (!icon) return
  const exportSize = Math.round(
    m.sizePx * (proj.exportWidthPx / 1080), // calibrate so on-screen size at 1080 = export size at 1080
  )
  const { canvas: tintedCanvas } = await tintSvg(icon.svg, m.color, exportSize, 1)
  const p = lonLatToExportPx(proj, m.lon, m.lat)
  // Anchor at bottom (pin tip points to coord)
  ctx.drawImage(tintedCanvas, p.x - exportSize / 2, p.y - exportSize, exportSize, exportSize)
}

function drawTitleBlock(
  ctx: CanvasRenderingContext2D,
  state: PosterState,
  colors: ThemeColors,
  W: number,
  H: number,
): void {
  const city = (state.title.cityLabel ?? state.title.city ?? '').toUpperCase()
  const country = (state.title.countryLabel ?? state.title.country ?? '').toUpperCase()
  const fontSizes = computeTitleFontSizes(W, city.length)
  const fontDef = findFont(state.font.id)
  const cssFamily = fontDef?.cssFamily ?? 'Inter Variable'
  const familyChain = `"${cssFamily}", system-ui, sans-serif`

  ctx.save()
  ctx.fillStyle = colors['ui.text']
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  type CtxWithLetterSpacing = CanvasRenderingContext2D & { letterSpacing?: string }

  // City — bold, big, wide letter-spacing
  if (city) {
    ctx.font = `700 ${fontSizes.city}px ${familyChain}`
    ;(ctx as CtxWithLetterSpacing).letterSpacing = `${0.18 * fontSizes.city}px`
    ctx.fillText(city, W / 2, H * 0.845)
  }

  // Divider — thin horizontal line
  const dividerY = H * 0.875
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
    ctx.font = `400 ${fontSizes.country}px ${familyChain}`
    ;(ctx as CtxWithLetterSpacing).letterSpacing = `${0.32 * fontSizes.country}px`
    ctx.globalAlpha = 0.85
    ctx.fillText(country, W / 2, H * 0.905)
  }

  // Coords
  if (state.title.showCoordinates) {
    ctx.font = `400 ${fontSizes.coords}px ${familyChain}`
    ;(ctx as CtxWithLetterSpacing).letterSpacing = `${0.18 * fontSizes.coords}px`
    ctx.globalAlpha = 0.6
    ctx.fillText(formatCoords(state.view.lat, state.view.lon), W / 2, H * 0.935)
  }

  ctx.restore()
}
