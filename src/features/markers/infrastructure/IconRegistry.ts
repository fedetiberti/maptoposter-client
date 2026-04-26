import DOMPurify from 'dompurify'
import { BUILTIN_ICONS } from '@/features/markers/infrastructure/builtinIcons'
import type { MarkerIcon } from '@/features/markers/domain/Marker'

const STORAGE_KEY = 'mtp.markers.custom.v1'
const MAX_SIZE_BYTES = 64 * 1024

/** Sanitize an arbitrary SVG string, returning '' if it's invalid/unsafe. */
function sanitizeSvg(rawSvg: string): string {
  const purified = DOMPurify.sanitize(rawSvg, {
    USE_PROFILES: { svg: true, svgFilters: false },
    FORBID_TAGS: ['script', 'foreignObject', 'image', 'a', 'use', 'iframe'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover'],
  })
  if (!purified.trim().toLowerCase().startsWith('<svg')) return ''
  // Force currentColor on monochrome icons. If the SVG has explicit fills, leave them.
  return purified
}

interface CustomIconRecord {
  id: string
  name: string
  svg: string
  createdAt: number
}

function readCustomFromStorage(): CustomIconRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is CustomIconRecord =>
        typeof x === 'object' &&
        x !== null &&
        'id' in x &&
        'svg' in x &&
        typeof (x as CustomIconRecord).id === 'string' &&
        typeof (x as CustomIconRecord).svg === 'string',
    )
  } catch {
    return []
  }
}

function writeCustomToStorage(records: CustomIconRecord[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore quota errors — caller decides if they care
  }
}

class IconRegistryImpl {
  private listeners = new Set<() => void>()

  list(): MarkerIcon[] {
    const custom = readCustomFromStorage().map((r) => ({
      id: r.id,
      name: r.name,
      svg: r.svg,
      source: 'custom' as const,
    }))
    return [...BUILTIN_ICONS, ...custom]
  }

  find(id: string): MarkerIcon | undefined {
    return this.list().find((i) => i.id === id)
  }

  /**
   * Add a custom SVG. Throws on invalid input. Returns the new MarkerIcon.
   */
  addCustom(rawSvg: string, name: string): MarkerIcon {
    const bytes = new Blob([rawSvg]).size
    if (bytes > MAX_SIZE_BYTES) {
      throw new Error(`SVG is too large (${(bytes / 1024).toFixed(1)} KB; max 64 KB)`)
    }
    const sanitized = sanitizeSvg(rawSvg)
    if (!sanitized) throw new Error('Not a valid SVG file')

    const records = readCustomFromStorage()
    const id = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const record: CustomIconRecord = {
      id,
      name: name || `Custom ${records.length + 1}`,
      svg: sanitized,
      createdAt: Date.now(),
    }
    records.push(record)
    writeCustomToStorage(records)
    this.emit()
    return { id, name: record.name, svg: sanitized, source: 'custom' }
  }

  removeCustom(id: string): void {
    const records = readCustomFromStorage().filter((r) => r.id !== id)
    writeCustomToStorage(records)
    this.emit()
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit(): void {
    for (const fn of this.listeners) fn()
  }
}

export const iconRegistry = new IconRegistryImpl()
