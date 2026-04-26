/**
 * Title-block geometry: city / divider / country / coordinates positioned at
 * fixed Y-ratios from the top of the poster. Mirrors the proportions used by
 * the original maptoposter and terraink-style poster apps.
 */
export const TITLE_BLOCK = {
  cityYRatio: 0.845,
  dividerYRatio: 0.875,
  countryYRatio: 0.905,
  coordsYRatio: 0.935,
  /** Reference width — fonts are scaled so this is the design size. */
  refWidthPx: 2480,
  /** Width of the divider line as a ratio of poster width. */
  dividerWidthRatio: 0.18,
  /** Stroke width of the divider, as a ratio of poster height. */
  dividerStrokeRatio: 0.0014,
  /** City font size at refWidthPx, before length-based scaling. */
  cityFontPx: 220,
  cityFontMinPx: 96,
  cityFontShrinkAt: 10,
  /** Country font size at refWidthPx. */
  countryFontPx: 56,
  /** Coordinates font size at refWidthPx. */
  coordsFontPx: 32,
  /** Letter spacing as ems. */
  cityLetterSpacingEm: 0.18,
  countryLetterSpacingEm: 0.32,
  coordsLetterSpacingEm: 0.18,
} as const

/** Scales the city font down for long names, never below cityFontMinPx. */
export function computeCityFontScale(
  cityLength: number,
): number {
  const len = Math.max(1, cityLength)
  if (len <= TITLE_BLOCK.cityFontShrinkAt) return 1
  const min = TITLE_BLOCK.cityFontMinPx / TITLE_BLOCK.cityFontPx
  const proportional = TITLE_BLOCK.cityFontShrinkAt / len
  return Math.max(min, proportional)
}

/** Compute font sizes (in px) for a poster of given pixel width. */
export function computeTitleFontSizes(posterWidthPx: number, cityLength: number) {
  const widthScale = posterWidthPx / TITLE_BLOCK.refWidthPx
  const cityScale = computeCityFontScale(cityLength)
  return {
    city: Math.round(TITLE_BLOCK.cityFontPx * widthScale * cityScale),
    country: Math.round(TITLE_BLOCK.countryFontPx * widthScale),
    coords: Math.round(TITLE_BLOCK.coordsFontPx * widthScale),
    divider: {
      widthPx: Math.round(posterWidthPx * TITLE_BLOCK.dividerWidthRatio),
      strokePx: Math.max(1, Math.round(posterWidthPx * TITLE_BLOCK.dividerStrokeRatio)),
    },
  }
}

/** Format coords as "35.6762° N · 139.6503° E" for the title block. */
export function formatCoords(lat: number, lon: number): string {
  const latH = lat >= 0 ? 'N' : 'S'
  const lonH = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latH} · ${Math.abs(lon).toFixed(4)}° ${lonH}`
}
