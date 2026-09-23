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
  /**
   * Reference aspect (A-series portrait). Font sizes scale with the width of
   * a portrait poster of the same height, so landscape and square layouts keep
   * the same vertical rhythm instead of the city line swallowing the divider.
   */
  refAspect: 2480 / 3508,
  /** Width of the divider line as a ratio of the reference width. */
  dividerWidthRatio: 0.18,
  /** Stroke width of the divider, as a ratio of the reference width. */
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
export function computeCityFontScale(cityLength: number): number {
  const len = Math.max(1, cityLength)
  if (len <= TITLE_BLOCK.cityFontShrinkAt) return 1
  const min = TITLE_BLOCK.cityFontMinPx / TITLE_BLOCK.cityFontPx
  const proportional = TITLE_BLOCK.cityFontShrinkAt / len
  return Math.max(min, proportional)
}

/**
 * The width the poster "behaves" as for typographic purposes: its real width
 * for portrait posters, or the width of a portrait poster with the same
 * height for square / landscape layouts.
 */
export function titleReferenceWidth(posterWidthPx: number, posterHeightPx: number): number {
  return Math.max(1, Math.min(posterWidthPx, posterHeightPx * TITLE_BLOCK.refAspect))
}

export interface TitleFontSizes {
  city: number
  country: number
  coords: number
  divider: { widthPx: number; strokePx: number }
}

/** Compute font sizes (in px) for a poster of the given pixel size. */
export function computeTitleFontSizes(
  posterWidthPx: number,
  posterHeightPx: number,
  cityLength: number,
): TitleFontSizes {
  const ref = titleReferenceWidth(posterWidthPx, posterHeightPx)
  const widthScale = ref / TITLE_BLOCK.refWidthPx
  const cityScale = computeCityFontScale(cityLength)
  return {
    city: Math.max(1, Math.round(TITLE_BLOCK.cityFontPx * widthScale * cityScale)),
    country: Math.max(1, Math.round(TITLE_BLOCK.countryFontPx * widthScale)),
    coords: Math.max(1, Math.round(TITLE_BLOCK.coordsFontPx * widthScale)),
    divider: {
      widthPx: Math.max(1, Math.round(ref * TITLE_BLOCK.dividerWidthRatio)),
      strokePx: Math.max(1, Math.round(ref * TITLE_BLOCK.dividerStrokeRatio)),
    },
  }
}

export interface TitleWeights {
  city: number
  country: number
  coords: number
}

/**
 * Pick real weights from the ones a font family actually ships, so neither
 * CSS nor canvas has to synthesise bold/light (which renders differently in
 * the two and looks muddy in print).
 */
export function resolveTitleWeights(
  availableWeights: readonly number[],
  preferredCityWeight: number,
): TitleWeights {
  const weights = [...new Set(availableWeights)].sort((a, b) => a - b)
  if (weights.length === 0) return { city: preferredCityWeight, country: 400, coords: 400 }
  const nearest = (target: number): number =>
    weights.reduce((best, w) => (Math.abs(w - target) < Math.abs(best - target) ? w : best))
  const city = weights.includes(preferredCityWeight) ? preferredCityWeight : nearest(700)
  return {
    city,
    country: weights[0] ?? city,
    coords: nearest(400),
  }
}

/** Format coords as "35.6762° N · 139.6503° E" for the title block. */
export function formatCoords(lat: number, lon: number): string {
  const latH = lat >= 0 ? 'N' : 'S'
  const lonH = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latH} · ${Math.abs(lon).toFixed(4)}° ${lonH}`
}
