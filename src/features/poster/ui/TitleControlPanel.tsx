import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'
import { FADE_PERCENT_DEFAULT, FADE_PERCENT_MAX } from '@/features/poster/domain/PosterState'

export function TitleControlPanel() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  return (
    <div className="space-y-2 text-sm">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Title block
      </h3>
      <Field
        label="City label"
        placeholder={state.title.city || '—'}
        value={state.title.cityLabel ?? ''}
        onChange={(v) => dispatch({ type: 'SET_TITLE', patch: { cityLabel: v || null } })}
      />
      <Field
        label="Country label"
        placeholder={state.title.country || '—'}
        value={state.title.countryLabel ?? ''}
        onChange={(v) => dispatch({ type: 'SET_TITLE', patch: { countryLabel: v || null } })}
      />
      <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border/40 bg-card/30 px-2.5 py-1.5">
        <span className="text-[11px] text-foreground">Show coordinates</span>
        <input
          type="checkbox"
          checked={state.title.showCoordinates}
          onChange={(e) =>
            dispatch({
              type: 'SET_TITLE',
              patch: { showCoordinates: e.target.checked },
            })
          }
          className="size-3.5 cursor-pointer accent-foreground"
        />
      </label>
      <FadeSlider
        value={state.fadePercent}
        onChange={(percent) => dispatch({ type: 'SET_FADE', percent })}
        onReset={() => dispatch({ type: 'SET_FADE', percent: FADE_PERCENT_DEFAULT })}
      />
    </div>
  )
}

/** Height of the top/bottom fade bands, as a percentage of the poster height. */
function FadeSlider({
  value,
  onChange,
  onReset,
}: {
  value: number
  onChange: (v: number) => void
  onReset: () => void
}) {
  return (
    <div className="rounded-md border border-border/40 bg-card/30 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor="fade-percent" className="text-[11px] text-foreground">
          Edge fade
        </label>
        <div className="flex items-center gap-2">
          <span className="readout text-[10px] text-muted-foreground">
            {value === 0 ? 'off' : `${value}%`}
          </span>
          {value !== FADE_PERCENT_DEFAULT && (
            <button
              type="button"
              onClick={onReset}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <input
        id="fade-percent"
        type="range"
        min={0}
        max={FADE_PERCENT_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={value === 0 ? 'off' : `${value}% of poster height`}
        className="w-full accent-foreground"
      />
      <p className="mt-1 text-[10px] text-muted-foreground/70">
        Gradient bands at the top and bottom, as a share of the poster height. 0 shows the map edge to edge.
      </p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-[12px]',
          'text-foreground placeholder:text-muted-foreground/70',
          'focus:outline-none focus:ring-2 focus:ring-ring',
        )}
      />
    </label>
  )
}
