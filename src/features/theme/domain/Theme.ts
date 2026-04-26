import type { ThemeColorKey } from '@/features/poster/domain/PosterState'

export type ThemeColors = Record<ThemeColorKey, string>

export interface Theme {
  id: string
  name: string
  description: string
  source: 'local' | 'authored'
  colors: ThemeColors
}

export type ThemeOverrides = Partial<ThemeColors>

export function resolveTheme(theme: Theme, overrides: ThemeOverrides): ThemeColors {
  return { ...theme.colors, ...overrides }
}
