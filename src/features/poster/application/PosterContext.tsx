import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  DEFAULT_POSTER_STATE,
  type PosterAction,
  type PosterState,
} from '@/features/poster/domain/PosterState'
import { posterReducer } from '@/features/poster/application/posterReducer'

interface PosterContextValue {
  state: PosterState
  dispatch: Dispatch<PosterAction>
}

const PosterContext = createContext<PosterContextValue | null>(null)

export function PosterProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: PosterState
}) {
  const [state, dispatch] = useReducer(
    posterReducer,
    initialState ?? DEFAULT_POSTER_STATE,
  )
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <PosterContext.Provider value={value}>{children}</PosterContext.Provider>
}

export function usePoster(): PosterContextValue {
  const ctx = useContext(PosterContext)
  if (!ctx) {
    throw new Error('usePoster must be used inside <PosterProvider>')
  }
  return ctx
}

export function usePosterState(): PosterState {
  return usePoster().state
}

export function usePosterDispatch(): Dispatch<PosterAction> {
  return usePoster().dispatch
}
