/**
 * Single source of truth for how a GPX track is stroked, shared by the live
 * MapLibre layer and the export compositor so the two agree.
 */

/** Zoom → line width (CSS px) stops used by the live layer's interpolate expression. */
export const GPX_LINE_WIDTH_STOPS: ReadonlyArray<readonly [zoom: number, widthPx: number]> = [
  [8, 1.5],
  [14, 3],
  [18, 6],
]

export const GPX_LINE_OPACITY = 0.95

/** Piecewise-linear evaluation of the stops above (clamped at the ends). */
export function gpxLineWidthAtZoom(zoom: number): number {
  const stops = GPX_LINE_WIDTH_STOPS
  const first = stops[0]
  const last = stops[stops.length - 1]
  if (!first || !last) return 2
  if (zoom <= first[0]) return first[1]
  if (zoom >= last[0]) return last[1]
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]
    const b = stops[i]
    if (!a || !b) continue
    if (zoom <= b[0]) {
      const t = (zoom - a[0]) / (b[0] - a[0])
      return a[1] + (b[1] - a[1]) * t
    }
  }
  return last[1]
}

/** The MapLibre `line-width` expression built from the same stops. */
export function gpxLineWidthExpression(): unknown[] {
  return ['interpolate', ['linear'], ['zoom'], ...GPX_LINE_WIDTH_STOPS.flatMap((s) => [s[0], s[1]])]
}
