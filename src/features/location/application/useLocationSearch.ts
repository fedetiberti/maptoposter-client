import { useEffect, useRef, useState } from 'react'
import type { Place } from '@/features/location/domain/Place'
import { services } from '@/core/services'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

interface UseLocationSearchResult {
  query: string
  setQuery: (q: string) => void
  results: Place[]
  loading: boolean
  error: string | null
  reset: () => void
}

interface Settled {
  query: string
  results: Place[]
  error: string | null
}

export function useLocationSearch(): UseLocationSearchResult {
  const [query, setQuery] = useState('')
  // The last query that produced a response (success or failure). Everything
  // else — `loading`, the visible results — is derived from comparing it with
  // the debounced query, so no state is written synchronously inside effects.
  const [settled, setSettled] = useState<Settled>({ query: '', results: [], error: null })
  const debouncedQuery = useDebouncedValue(query, 350)
  const abortRef = useRef<AbortController | null>(null)

  const trimmed = debouncedQuery.trim()
  const active = trimmed.length >= 2

  useEffect(() => {
    abortRef.current?.abort()
    if (!active) return
    const ctrl = new AbortController()
    abortRef.current = ctrl
    services.nominatim
      .search(trimmed, { signal: ctrl.signal })
      .then((places) => {
        if (ctrl.signal.aborted) return
        setSettled({ query: trimmed, results: places, error: null })
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return
        setSettled({
          query: trimmed,
          results: [],
          error: e instanceof Error ? e.message : 'Search failed',
        })
      })
    return () => ctrl.abort()
  }, [trimmed, active])

  const isCurrent = settled.query === trimmed
  return {
    query,
    setQuery,
    results: active && isCurrent ? settled.results : [],
    loading: active && !isCurrent,
    error: active && isCurrent ? settled.error : null,
    reset: () => {
      abortRef.current?.abort()
      setQuery('')
      setSettled({ query: '', results: [], error: null })
    },
  }
}
