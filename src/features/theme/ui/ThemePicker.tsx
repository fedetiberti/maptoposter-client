import { THEMES } from '@/data/themes'
import type { Theme } from '@/features/theme/domain/Theme'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'

function ThemeSwatch({ colors }: { colors: Theme['colors'] }) {
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-md ring-1 ring-border/50"
      style={{ background: colors['map.land'] }}
      aria-hidden
    >
      {/* water body */}
      <div
        className="absolute -left-2 top-1 h-7 w-9 rounded-full"
        style={{ background: colors['map.water'] }}
      />
      {/* park */}
      <div
        className="absolute bottom-[38%] right-2 h-5 w-6 rounded-sm"
        style={{ background: colors['map.parks'] }}
      />
      {/* roads */}
      <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2" style={{ background: colors['map.roads.major'] }} />
      <div
        className="absolute inset-x-3 top-[40%] h-px"
        style={{ background: colors['map.roads.minor_high'], opacity: 0.85 }}
      />
      <div
        className="absolute inset-x-4 top-[60%] h-px"
        style={{ background: colors['map.roads.minor_mid'], opacity: 0.7 }}
      />
      <div
        className="absolute inset-y-3 left-[62%] w-px"
        style={{ background: colors['map.roads.minor_low'], opacity: 0.7 }}
      />
      {/* title stub */}
      <div
        className="absolute bottom-1.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full"
        style={{ background: colors['ui.text'], opacity: 0.6 }}
      />
    </div>
  )
}

function ThemeSection({
  title,
  themes,
  selectedId,
  onSelect,
}: {
  title: string
  themes: readonly Theme[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  if (themes.length === 0) return null
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title} ({themes.length})
      </h3>
      <div className="grid grid-cols-3 gap-2" role="listbox" aria-label={title}>
        {themes.map((t) => {
          const selected = selectedId === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(t.id)}
              className={cn(
                'group relative flex flex-col items-stretch gap-1.5 rounded-md p-1 text-left transition',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'bg-card ring-2 ring-foreground/80' : 'hover:bg-card/60',
              )}
              title={t.description}
            >
              <ThemeSwatch colors={t.colors} />
              <span
                className={cn(
                  'truncate px-0.5 text-[11px] font-medium',
                  selected ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {t.name}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const SECTIONS: ReadonlyArray<{ title: string; source: Theme['source'] }> = [
  { title: 'Originals', source: 'local' },
  { title: 'Authored', source: 'authored' },
  { title: 'Atelier', source: 'atelier' },
]

export function ThemePicker() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const hasOverrides = Object.keys(state.theme.overrides).length > 0

  return (
    <div className="space-y-4 text-sm">
      {hasOverrides && (
        <p className="rounded-md border border-[var(--brass)]/30 bg-[var(--brass)]/10 px-2.5 py-1.5 text-[11px] text-foreground/90">
          Picking a theme clears your per-layer color overrides.
        </p>
      )}
      {SECTIONS.map((s) => (
        <ThemeSection
          key={s.source}
          title={s.title}
          themes={THEMES.filter((t) => t.source === s.source)}
          selectedId={state.theme.id}
          onSelect={(id) => dispatch({ type: 'SET_THEME', themeId: id })}
        />
      ))}
    </div>
  )
}
