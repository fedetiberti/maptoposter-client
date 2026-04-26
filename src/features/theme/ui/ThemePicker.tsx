import { THEMES } from '@/data/themes'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'

function ThemeSwatch({
  background,
  text,
  major,
  minorHigh,
  minorMid,
}: {
  background: string
  text: string
  major: string
  minorHigh: string
  minorMid: string
}) {
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-md ring-1 ring-border/50"
      style={{ background }}
    >
      <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2" style={{ background: major }} />
      <div
        className="absolute inset-x-3 top-[40%] h-px"
        style={{ background: minorHigh, opacity: 0.85 }}
      />
      <div
        className="absolute inset-x-4 top-[60%] h-px"
        style={{ background: minorMid, opacity: 0.7 }}
      />
      <div
        className="absolute bottom-1.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full"
        style={{ background: text, opacity: 0.5 }}
      />
    </div>
  )
}

export function ThemePicker() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const local = THEMES.filter((t) => t.source === 'local')
  const authored = THEMES.filter((t) => t.source === 'authored')

  return (
    <div className="space-y-4 text-sm">
      <Section title="Originals (18)" themes={local} />
      <Section title="Authored (17)" themes={authored} />
    </div>
  )

  function Section({
    title,
    themes,
  }: {
    title: string
    themes: typeof THEMES
  }) {
    return (
      <section>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => {
            const selected = state.theme.id === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => dispatch({ type: 'SET_THEME', themeId: t.id })}
                className={cn(
                  'group relative flex flex-col items-stretch gap-1.5 rounded-md p-1 text-left transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'bg-card ring-2 ring-foreground/80'
                    : 'hover:bg-card/60',
                )}
                title={t.description}
              >
                <ThemeSwatch
                  background={t.colors['map.land']}
                  text={t.colors['ui.text']}
                  major={t.colors['map.roads.major']}
                  minorHigh={t.colors['map.roads.minor_high']}
                  minorMid={t.colors['map.roads.minor_mid']}
                />
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
}
