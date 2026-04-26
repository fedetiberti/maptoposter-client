import { useEffect, useRef } from 'react'
import { services } from '@/core/services'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

/**
 * If `state.reverseGeocodeOnPan === true`, watches `view` and updates
 * `title.{city,country}` to whatever Nominatim resolves the center to.
 * User edits to title labels (`cityLabel`, `countryLabel`) are independent
 * and not touched here.
 */
export function useReverseGeocoder(): void {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const enabled = state.reverseGeocodeOnPan
  const debouncedView = useDebouncedValue(state.view, 1500)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    services.nominatim
      .reverse(debouncedView.lat, debouncedView.lon, { signal: ctrl.signal })
      .then((place) => {
        if (ctrl.signal.aborted || !place) return
        dispatch({
          type: 'SET_TITLE',
          patch: {
            city: place.city ?? state.title.city,
            country: place.country ?? state.title.country,
          },
        })
      })
      .catch(() => undefined)
    return () => ctrl.abort()
    // we want to fire only on debounced view + enabled change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedView.lat, debouncedView.lon, enabled])
}
