import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

interface Size {
  width: number
  height: number
}

export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
): Size | null {
  const [size, setSize] = useState<Size | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const cr = entry.contentRect
      setSize({ width: cr.width, height: cr.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}
