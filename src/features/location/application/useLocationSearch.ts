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

export function useLocationSearch(): UseLocationSearchResult {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebouncedValue(query, 350)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError(null)
    services.nominatim
      .search(trimmed, { signal: ctrl.signal })
      .then((places) => {
        if (ctrl.signal.aborted) return
        setResults(places)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Search failed')
        setLoading(false)
      })
    return () => ctrl.abort()
  }, [debouncedQuery])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    reset: () => {
      setQuery('')
      setResults([])
      setError(null)
    },
  }
}
