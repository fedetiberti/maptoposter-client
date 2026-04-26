/**
 * Lazy-load a Google Font on demand. Cached in-memory so subsequent calls
 * are no-ops; relies on document.fonts.load() to resolve only after the
 * face is actually painted-ready.
 */

const loaded = new Set<string>()
const inFlight = new Map<string, Promise<void>>()

function injectStylesheet(family: string, weights: number[]): HTMLLinkElement {
  const id = `gfont-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const existing = document.getElementById(id) as HTMLLinkElement | null
  if (existing) return existing
  const url = new URL('https://fonts.googleapis.com/css2')
  const safeFamily = family.replace(/ /g, '+')
  const sortedWeights = [...new Set(weights)].sort((a, b) => a - b)
  url.searchParams.set('family', `${safeFamily}:wght@${sortedWeights.join(';')}`)
  url.searchParams.set('display', 'swap')
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = url.toString()
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
  return link
}

export function isFontLoaded(family: string, weight: number): boolean {
  try {
    return document.fonts.check(`${weight} 16px "${family}"`)
  } catch {
    return false
  }
}

export async function ensureGoogleFont(
  family: string,
  weights: number[] = [400, 700],
): Promise<void> {
  const key = `${family}|${weights.join(',')}`
  if (loaded.has(key)) return
  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async () => {
    injectStylesheet(family, weights)
    // Best-effort: ensure each weight resolves in the FontFaceSet.
    await Promise.all(
      weights.map((w) =>
        document.fonts.load(`${w} 16px "${family}"`).catch(() => undefined),
      ),
    )
    await document.fonts.ready
    loaded.add(key)
  })()
  inFlight.set(key, promise)
  try {
    await promise
  } finally {
    inFlight.delete(key)
  }
}

/** Pre-export gate: resolve the active font (bundled or Google) is paint-ready. */
export async function ensureFontReady(
  cssFamily: string,
  googleFamily: string | null,
  weight: number,
): Promise<void> {
  if (googleFamily) {
    await ensureGoogleFont(googleFamily, [weight])
  }
  // For bundled fonts, just await the FontFaceSet ready signal.
  await document.fonts.load(`${weight} 16px "${cssFamily}"`).catch(() => undefined)
  await document.fonts.ready
}
