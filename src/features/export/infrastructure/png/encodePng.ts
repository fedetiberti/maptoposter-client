import { injectPhys } from '@/features/export/infrastructure/png/injectPhys'

/** Encode a canvas to PNG and inject a pHYs chunk advertising the export DPI. */
export async function encodePng(
  canvas: HTMLCanvasElement,
  dpi: number,
): Promise<Blob> {
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) reject(new Error('canvas.toBlob failed'))
      else resolve(b)
    }, 'image/png')
  })
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const withDpi = injectPhys(bytes, dpi)
  // Cast: lib.dom's BlobPart type prefers ArrayBuffer over ArrayBufferLike.
  return new Blob([withDpi as unknown as BlobPart], { type: 'image/png' })
}
