/**
 * Rasterize an SVG string at a given size and tint via canvas
 * `globalCompositeOperation = 'source-in'`. Returns a canvas (live use)
 * and an image data URL (export use).
 */
export interface TintedRaster {
  canvas: HTMLCanvasElement
  dataUrl: string
}

const cache = new Map<string, Promise<TintedRaster>>()

export function tintSvg(
  svg: string,
  color: string,
  sizePx: number,
  dpr = window.devicePixelRatio || 1,
): Promise<TintedRaster> {
  const key = `${svg.length}|${color}|${sizePx}|${dpr.toFixed(2)}|${hash(svg)}`
  const cached = cache.get(key)
  if (cached) return cached
  const promise = rasterize(svg, color, sizePx, dpr)
  cache.set(key, promise)
  return promise
}

async function rasterize(
  svg: string,
  color: string,
  sizePx: number,
  dpr: number,
): Promise<TintedRaster> {
  // Replace currentColor with the requested color so monochrome icons paint correctly.
  const colored = svg.replace(/currentColor/g, color)
  const blob = new Blob([colored], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const w = Math.max(1, Math.round(sizePx * dpr))
    const h = w
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) throw new Error('2D context unavailable')
    ctx.drawImage(img, 0, 0, w, h)

    // Apply tint: paint the color through the alpha mask of the existing content.
    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
    return { canvas, dataUrl: canvas.toDataURL('image/png') }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('SVG failed to load as image'))
    img.src = url
  })
}

function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h.toString(36)
}
