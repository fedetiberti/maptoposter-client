import {
  LAYER_TOGGLE_IDS,
  type LayerToggleId,
} from '@/features/poster/domain/PosterState'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'

const LABELS: Record<LayerToggleId, string> = {
  landcover: 'Landcover',
  buildings: 'Buildings',
  water: 'Water',
  waterway: 'Waterways',
  parks: 'Parks',
  aeroway: 'Aeroways',
  rail: 'Rail',
  roads: 'Roads',
  roads_path: 'Footpaths',
  roads_minor_low: 'Minor roads',
  roads_outline: 'Road casing',
}

export function LayerTogglesPanel() {
  const { layers } = usePosterState()
  const dispatch = usePosterDispatch()
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Layers
      </h3>
      <ul className="grid grid-cols-2 gap-1.5">
        {LAYER_TOGGLE_IDS.map((id) => {
          const enabled = layers[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_LAYER_TOGGLE',
                    layer: id,
                    enabled: !enabled,
                  })
                }
                aria-pressed={enabled}
                className={
                  enabled
                    ? 'flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-foreground/10 px-2.5 py-1.5 text-[11px] text-foreground transition'
                    : 'flex w-full items-center justify-between gap-2 rounded-md border border-border/40 bg-card/30 px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:bg-card/60'
                }
              >
                <span className="truncate">{LABELS[id]}</span>
                <span
                  className={
                    enabled
                      ? 'size-1.5 rounded-full bg-emerald-400'
                      : 'size-1.5 rounded-full bg-muted-foreground/50'
                  }
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
