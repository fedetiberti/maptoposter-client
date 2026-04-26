/**
 * Hand-rolled minimal PDF 1.4 wrapping a single JPEG-encoded canvas page.
 *
 * Structure:
 *   %PDF-1.4
 *   1 0 obj  Catalog → Pages
 *   2 0 obj  Pages   → [Page]
 *   3 0 obj  Page    → MediaBox, Resources, Contents
 *   4 0 obj  XObject (DCTDecode JPEG of canvas)
 *   5 0 obj  Stream  (drawing operators)
 *   xref
 *   trailer / startxref
 *   %%EOF
 */

interface PdfOpts {
  canvas: HTMLCanvasElement
  /** Physical page size in inches at 1 PDF unit = 1/72 inch. */
  widthIn: number
  heightIn: number
  /** JPEG quality 0..1. */
  quality?: number
}

function asciiBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff
  return out
}

async function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array> {
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error('canvas.toBlob (jpeg) failed'))
        else resolve(b)
      },
      'image/jpeg',
      quality,
    )
  })
  return new Uint8Array(await blob.arrayBuffer())
}

export async function encodePdf({
  canvas,
  widthIn,
  heightIn,
  quality = 0.92,
}: PdfOpts): Promise<Blob> {
  const widthPt = Math.round(widthIn * 72)
  const heightPt = Math.round(heightIn * 72)

  const jpeg = await canvasToJpegBytes(canvas, quality)

  // Build the PDF assembling chunks with explicit byte offsets so xref is correct.
  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let cursor = 0
  function push(bytes: Uint8Array): void {
    chunks.push(bytes)
    cursor += bytes.length
  }

  push(asciiBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'))

  // Object 1 — Catalog
  offsets[1] = cursor
  push(asciiBytes('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'))

  // Object 2 — Pages
  offsets[2] = cursor
  push(asciiBytes('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'))

  // Object 3 — Page
  offsets[3] = cursor
  push(
    asciiBytes(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] ` +
        `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    ),
  )

  // Object 4 — XObject Image (JPEG via DCTDecode)
  offsets[4] = cursor
  const imgHeader = asciiBytes(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  )
  push(imgHeader)
  push(jpeg)
  push(asciiBytes('\nendstream\nendobj\n'))

  // Object 5 — Contents (drawing the image)
  const contentStream = `q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im0 Do\nQ\n`
  const contentBytes = asciiBytes(contentStream)
  offsets[5] = cursor
  push(asciiBytes(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`))
  push(contentBytes)
  push(asciiBytes('\nendstream\nendobj\n'))

  // xref table
  const xrefStart = cursor
  let xref = `xref\n0 6\n0000000000 65535 f \n`
  for (let i = 1; i <= 5; i++) {
    xref += `${(offsets[i] ?? 0).toString().padStart(10, '0')} 00000 n \n`
  }
  push(asciiBytes(xref))
  push(
    asciiBytes(
      `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
    ),
  )

  // Concat — cast each chunk for lib.dom strictness.
  const blob = new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' })
  return blob
}
