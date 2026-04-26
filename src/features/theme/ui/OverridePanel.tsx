import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import {
  THEME_COLOR_KEYS,
  type ThemeColorKey,
} from '@/features/poster/domain/PosterState'
import { findTheme, THEMES } from '@/data/themes'
import { resolveTheme } from '@/features/theme/domain/Theme'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'

const KEY_LABELS: Record<ThemeColorKey, string> = {
  'ui.bg': 'UI background',
  'ui.text': 'UI text',
  'map.land': 'Land',
  'map.landcover': 'Landcover',
  'map.water': 'Water',
  'map.waterway': 'Waterway',
  'map.parks': 'Parks',
  'map.buildings': 'Buildings',
  'map.aeroway': 'Aeroway',
  'map.rail': 'Rail',
  'map.roads.major': 'Roads · major',
  'map.roads.minor_high': 'Roads · minor high',
  'map.roads.minor_mid': 'Roads · minor mid',
  'map.roads.minor_low': 'Roads · minor low',
  'map.roads.path': 'Paths',
  'map.roads.outline': 'Road outline',
}

export function OverridePanel() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const [openKey, setOpenKey] = useState<ThemeColorKey | null>(null)
  const fallback = THEMES[0]
  if (!fallback) return null
  const theme = findTheme(state.theme.id) ?? fallback
  const resolved = resolveTheme(theme, state.theme.overrides)
  const hasOverrides = Object.keys(state.theme.overrides).length > 0

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Per-layer colors
        </h3>
        <button
          type="button"
          disabled={!hasOverrides}
          onClick={() => dispatch({ type: 'CLEAR_ALL_THEME_OVERRIDES' })}
          className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-1.5">
        {THEME_COLOR_KEYS.map((key) => {
          const overridden = key in state.theme.overrides
          const value = resolved[key]
          const open = openKey === key
          return (
            <li key={key} className="relative">
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md border border-border/40 bg-card/40 px-2 py-1.5 text-left transition',
                  'hover:bg-card/70',
                  overridden && 'ring-1 ring-foreground/60',
                )}
              >
                <span
                  className="size-4 shrink-0 rounded-sm ring-1 ring-border/60"
                  style={{ background: value }}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[11px] text-foreground">
                    {KEY_LABELS[key]}
                  </span>
                  <span className="truncate text-[10px] font-mono text-muted-foreground">
                    {value.toUpperCase()}
                  </span>
                </span>
              </button>
              {open && (
                <div
                  className="absolute z-30 mt-1 rounded-md border border-border/60 bg-popover p-2 shadow-2xl"
                  style={{ width: 220 }}
                >
                  <HexColorPicker
                    color={value}
                    onChange={(c) =>
                      dispatch({ type: 'SET_THEME_OVERRIDE', key, value: c })
                    }
                  />
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono text-muted-foreground">
                      {value.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {overridden && (
                        <button
                          type="button"
                          onClick={() =>
                            dispatch({ type: 'CLEAR_THEME_OVERRIDE', key })
                          }
                          className="rounded px-1.5 py-0.5 text-muted-foreground hover:bg-card hover:text-foreground"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenKey(null)}
                        className="rounded bg-foreground px-1.5 py-0.5 text-background"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
