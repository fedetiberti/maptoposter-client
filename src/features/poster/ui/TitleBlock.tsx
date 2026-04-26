import { computeTitleFontSizes, formatCoords } from '@/features/poster/domain/textLayout'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { findFont } from '@/data/fonts'

interface TitleBlockProps {
  /** Width in CSS px of the poster preview area. */
  width: number
  /** Height in CSS px of the poster preview area. */
  height: number
  /** Optional override poster width for export-time rendering (skip layout scaling). */
  exportWidthPx?: number
}

/**
 * Renders the four-line title block (city / divider / country / coords).
 * In preview mode, font sizes are computed from the on-screen poster width.
 * In export mode, pass the full export pixel width via `exportWidthPx`.
 */
export function TitleBlock({ width, height, exportWidthPx }: TitleBlockProps) {
  const { title, view, theme: themeSel, font } = usePosterState()
  const fallback = THEMES[0]
  if (!fallback) return null
  const theme = findTheme(themeSel.id) ?? fallback
  const colors = resolveTheme(theme, themeSel.overrides)

  const referenceWidth = exportWidthPx ?? width
  const city = (title.cityLabel ?? title.city ?? '').toUpperCase()
  const country = (title.countryLabel ?? title.country ?? '').toUpperCase()
  const fontSizes = computeTitleFontSizes(referenceWidth, city.length)

  // Convert to CSS px from export px (for preview).
  const previewScale = width / referenceWidth
  const cityFontPx = fontSizes.city * previewScale
  const countryFontPx = fontSizes.country * previewScale
  const coordsFontPx = fontSizes.coords * previewScale
  const dividerWidthPx = fontSizes.divider.widthPx * previewScale
  const dividerStrokePx = Math.max(1, fontSizes.divider.strokePx * previewScale)

  const fontDef = findFont(font.id)
  const fontFamily = `"${fontDef?.cssFamily ?? font.googleFamily ?? 'Inter Variable'}", system-ui, sans-serif`

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 flex flex-col items-center"
      style={{ bottom: 0, color: colors['ui.text'] }}
    >
      {/* City */}
      <div
        style={{
          position: 'absolute',
          top: `${100 * 0.845}%`,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          fontFamily,
          fontSize: `${cityFontPx}px`,
          letterSpacing: '0.18em',
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {city || '—'}
      </div>

      {/* Divider */}
      <div
        style={{
          position: 'absolute',
          top: `${100 * 0.875}%`,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          width: `${dividerWidthPx}px`,
          height: `${dividerStrokePx}px`,
          background: colors['ui.text'],
          opacity: 0.7,
        }}
      />

      {/* Country */}
      <div
        style={{
          position: 'absolute',
          top: `${100 * 0.905}%`,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          fontFamily,
          fontSize: `${countryFontPx}px`,
          letterSpacing: '0.32em',
          fontWeight: 300,
          opacity: 0.85,
          whiteSpace: 'nowrap',
        }}
      >
        {country || '—'}
      </div>

      {/* Coords */}
      {title.showCoordinates && (
        <div
          style={{
            position: 'absolute',
            top: `${100 * 0.935}%`,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            fontFamily,
            fontSize: `${coordsFontPx}px`,
            letterSpacing: '0.18em',
            fontWeight: 400,
            opacity: 0.6,
            whiteSpace: 'nowrap',
          }}
        >
          {formatCoords(view.lat, view.lon)}
        </div>
      )}

      <div style={{ height: `${height}px` }} />
    </div>
  )
}

