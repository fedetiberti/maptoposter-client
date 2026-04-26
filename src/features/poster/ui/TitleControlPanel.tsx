import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'

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
