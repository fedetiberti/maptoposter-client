/** PNG-flavored CRC32 (polynomial 0xEDB88320, init 0xFFFFFFFF, reflected). */
let table: Uint32Array | null = null

function makeTable(): Uint32Array {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    t[n] = c >>> 0
  }
  return t
}

export function crc32(bytes: Uint8Array, start = 0, end = bytes.length): number {
  if (!table) table = makeTable()
  let c = 0xffffffff
  for (let i = start; i < end; i++) {
    const idx = (c ^ (bytes[i] ?? 0)) & 0xff
    c = (table[idx] ?? 0) ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}
