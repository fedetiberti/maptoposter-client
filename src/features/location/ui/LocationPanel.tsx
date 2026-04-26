import { LocationSearch } from '@/features/location/ui/LocationSearch'
import { CoordinateInput } from '@/features/location/ui/CoordinateInput'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'

export function LocationPanel() {
  const { reverseGeocodeOnPan, title } = usePosterState()
  const dispatch = usePosterDispatch()
  return (
    <div className="space-y-3">
      <LocationSearch />
      <CoordinateInput />
      <div className="space-y-2 border-t border-border/30 pt-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Resolved
        </div>
        <div className="rounded-md bg-card/40 px-2.5 py-1.5 text-[12px]">
          <div className="text-foreground">{title.city || '—'}</div>
          <div className="text-muted-foreground">{title.country || '—'}</div>
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border/40 bg-card/30 px-2.5 py-1.5">
          <span className="text-[11px] text-foreground">
            Auto-update names on pan
          </span>
          <input
            type="checkbox"
            checked={reverseGeocodeOnPan}
            onChange={(e) =>
              dispatch({
                type: 'SET_REVERSE_GEOCODE_ON_PAN',
                enabled: e.target.checked,
              })
            }
            className="size-3.5 cursor-pointer accent-foreground"
          />
        </label>
      </div>
    </div>
  )
}
