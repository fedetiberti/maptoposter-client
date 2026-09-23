import { useEffect } from 'react'
import { services } from '@/core/services'
import {
  computeTitleFontSizes,
  formatCoords,
  resolveTitleWeights,
  TITLE_BLOCK,
} from '@/features/poster/domain/textLayout'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import { usePosterState } from '@/features/poster/application/PosterContext'
import { useFrameCenter } from '@/features/poster/application/useFrameCenter'
import { findFont } from '@/data/fonts'

interface TitleBlockProps {
  /** Width in CSS px of the poster preview area. */
  width: number
  /** Height in CSS px of the poster preview area. */
  height: number
}

/**
 * Renders the four-line title block (city / divider / country / coords).
 * Font sizes are computed from the on-screen poster box with exactly the same
 * domain function the export compositor uses, so preview and print agree.
 */
export function TitleBlock({ width, height }: TitleBlockProps) {
  const { title, theme: themeSel, font } = usePosterState()
  const center = useFrameCenter()

  // Make sure the selected family is actually loaded (Google Fonts are lazy),
  // including on first boot from a persisted / shared state.
  useEffect(() => {
    services.fonts.ensureLoaded(font.id).catch(() => undefined)
  }, [font.id])

  const fallback = THEMES[0]
  if (!fallback) return null
  const theme = findTheme(themeSel.id) ?? fallback
  const colors = resolveTheme(theme, themeSel.overrides)

  const city = (title.cityLabel ?? title.city ?? '').toUpperCase()
  const country = (title.countryLabel ?? title.country ?? '').toUpperCase()
  const fontSizes = computeTitleFontSizes(width, height, city.length)

  const fontDef = findFont(font.id)
  const fontFamily = `"${fontDef?.cssFamily ?? font.googleFamily ?? 'Inter Variable'}", system-ui, sans-serif`
  const weights = resolveTitleWeights(fontDef?.weights ?? [font.weight], font.weight)

  // CSS letter-spacing adds a trailing gap after the last glyph, which would
  // shift the visible ink left of centre; pad the same amount on the left so
  // the ink itself is centred (the export compositor does the equivalent).
  const line = (top: number, fontPx: number, spacingEm: number): React.CSSProperties => ({
    position: 'absolute',
    top: `${top * 100}%`,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    fontSize: `${fontPx}px`,
    letterSpacing: `${spacingEm}em`,
    paddingLeft: `${spacingEm}em`,
  })

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ color: colors['ui.text'] }}
      data-testid="title-block"
    >
      <div
        style={{
          ...line(TITLE_BLOCK.cityYRatio, fontSizes.city, TITLE_BLOCK.cityLetterSpacingEm),
          fontWeight: weights.city,
        }}
      >
        {city || '—'}
      </div>

      <div
        style={{
          position: 'absolute',
          top: `${TITLE_BLOCK.dividerYRatio * 100}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${fontSizes.divider.widthPx}px`,
          height: `${fontSizes.divider.strokePx}px`,
          background: colors['ui.text'],
          opacity: 0.7,
        }}
      />

      <div
        style={{
          ...line(TITLE_BLOCK.countryYRatio, fontSizes.country, TITLE_BLOCK.countryLetterSpacingEm),
          fontWeight: weights.country,
          opacity: 0.85,
        }}
      >
        {country || '—'}
      </div>

      {title.showCoordinates && (
        <div
          style={{
            ...line(TITLE_BLOCK.coordsYRatio, fontSizes.coords, TITLE_BLOCK.coordsLetterSpacingEm),
            fontWeight: weights.coords,
            opacity: 0.6,
          }}
        >
          {formatCoords(center.lat, center.lon)}
        </div>
      )}
    </div>
  )
}
