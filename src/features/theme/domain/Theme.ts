import type { ThemeColorKey } from '@/features/poster/domain/PosterState'

export type ThemeColors = Record<ThemeColorKey, string>

export interface Theme {
  id: string
  name: string
  description: string
  /** local = ported from the Python maptoposter; authored = terraink-style register; atelier = designed for this app. */
  source: 'local' | 'authored' | 'atelier'
  colors: ThemeColors
}

export type ThemeOverrides = Partial<ThemeColors>

export function resolveTheme(theme: Theme, overrides: ThemeOverrides): ThemeColors {
  return { ...theme.colors, ...overrides }
}
