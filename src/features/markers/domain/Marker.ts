export interface MarkerIcon {
  id: string
  name: string
  /** Inline SVG string (sanitized at registry time). */
  svg: string
  source: 'builtin' | 'custom'
}

export const MARKER_DEFAULTS = {
  size: 28,
  color: '#FF3B30',
  iconId: 'pin',
} as const
