/**
 * Parse a hex color string into [r, g, b] in 0..255.
 * Accepts #RGB, #RRGGBB.
 */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (h.length !== 6) {
    throw new Error(`invalid hex color: ${hex}`)
  }
  const num = parseInt(h, 16)
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/**
 * Linear blend in sRGB. Not perceptually uniform, but matches the existing
 * local-app palette intent for derived keys.
 */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  const u = Math.max(0, Math.min(1, t))
  return rgbToHex(
    ar + (br - ar) * u,
    ag + (bg - ag) * u,
    ab + (bb - ab) * u,
  )
}

/** Lighten/darken using mix toward white/black. */
export function lighten(c: string, t: number): string {
  return mix(c, '#ffffff', t)
}

export function darken(c: string, t: number): string {
  return mix(c, '#000000', t)
}

/** Add an alpha component. */
export function withAlpha(c: string, alpha: number): string {
  const [r, g, b] = hexToRgb(c)
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
