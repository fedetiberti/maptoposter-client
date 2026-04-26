/**
 * Minimal SVG export: wraps the composited PNG as a single <image> inside an
 * <svg viewBox>. Layered SVG (per-MapLibre-layer snapshots) is a planned
 * enhancement; this one-image version is honest about being raster-in-svg.
 */
export async function encodeSvg(canvas: HTMLCanvasElement): Promise<Blob> {
  const dataUrl = canvas.toDataURL('image/png')
  const W = canvas.width
  const H = canvas.height
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <image x="0" y="0" width="${W}" height="${H}" xlink:href="${dataUrl}" />
</svg>`
  return new Blob([svg], { type: 'image/svg+xml' })
}
