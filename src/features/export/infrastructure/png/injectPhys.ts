import { crc32 } from '@/features/export/infrastructure/png/crc32'

const PNG_SIG_LEN = 8

function writeU32BE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, false)
}

/**
 * Build a 21-byte pHYs chunk:
 *   length(4) + type(4='pHYs') + data(9) + crc(4)
 * Data: xPxPerMeter(4) + yPxPerMeter(4) + unit(1, 1=meters)
 */
function buildPhysChunk(dpi: number): Uint8Array {
  const ppm = Math.round(dpi / 0.0254)
  const buf = new Uint8Array(21)
  const view = new DataView(buf.buffer)
  writeU32BE(view, 0, 9) // data length (not including type)
  buf.set([0x70, 0x48, 0x59, 0x73], 4) // 'pHYs'
  writeU32BE(view, 8, ppm)
  writeU32BE(view, 12, ppm)
  buf[16] = 1 // unit = meters
  const crc = crc32(buf, 4, 17) // CRC over type + data
  writeU32BE(view, 17, crc)
  return buf
}

/**
 * Inject a pHYs chunk into a PNG byte stream right after the IHDR chunk.
 * Returns a new Uint8Array; throws on invalid input.
 */
export function injectPhys(png: Uint8Array, dpi: number): Uint8Array {
  if (png.length < PNG_SIG_LEN + 25) throw new Error('PNG too short')
  // First 8 bytes are the PNG signature, then IHDR is the first chunk:
  //   IHDR length (4) + 'IHDR' (4) + IHDR data (13) + IHDR crc (4) = 25
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  const ihdrLength = view.getUint32(PNG_SIG_LEN, false)
  // Sanity check: chunk type at PNG_SIG_LEN+4 must be 'IHDR'
  const ihdrEndOffset = PNG_SIG_LEN + 4 + 4 + ihdrLength + 4
  const isIhdr =
    png[PNG_SIG_LEN + 4] === 0x49 &&
    png[PNG_SIG_LEN + 5] === 0x48 &&
    png[PNG_SIG_LEN + 6] === 0x44 &&
    png[PNG_SIG_LEN + 7] === 0x52
  if (!isIhdr) throw new Error('first chunk is not IHDR')
  const phys = buildPhysChunk(dpi)
  const out = new Uint8Array(png.length + phys.length)
  out.set(png.subarray(0, ihdrEndOffset), 0)
  out.set(phys, ihdrEndOffset)
  out.set(png.subarray(ihdrEndOffset), ihdrEndOffset + phys.length)
  return out
}
