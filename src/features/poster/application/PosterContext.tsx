import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  DEFAULT_POSTER_STATE,
  type PosterAction,
  type PosterState,
} from '@/features/poster/domain/PosterState'
import { posterReducer } from '@/features/poster/application/posterReducer'
import {
  loadPersistedState,
  persistState,
} from '@/features/poster/application/persistState'
import { clearShareHash, readShareFromHash } from '@/features/poster/application/shareUrl'

interface PosterContextValue {
  state: PosterState
  dispatch: Dispatch<PosterAction>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const PosterContext = createContext<PosterContextValue | null>(null)

const HISTORY_LIMIT = 50

function bootInitialState(explicit?: PosterState): PosterState {
  if (explicit) return explicit
  const fromHash = readShareFromHash()
  if (fromHash) {
    clearShareHash()
    return fromHash
  }
  return loadPersistedState() ?? DEFAULT_POSTER_STATE
}

export function PosterProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: PosterState
}) {
  const [state, dispatch] = useReducer(
    posterReducer,
    undefined,
    () => bootInitialState(initialState),
  )

  // Persist (debounced) whenever state changes.
  useEffect(() => {
    persistState(state)
  }, [state])

  // Undo/redo history. We only push to undo when the *type* of action is
  // "structural" — we skip rapid camera changes (SET_VIEW) to avoid filling
  // the stack with pan deltas.
  const undoRef = useRef<PosterState[]>([])
  const redoRef = useRef<PosterState[]>([])
  const lastSnapshotRef = useRef<PosterState>(state)
  const isJumpingRef = useRef(false)

  // After every render, decide whether to snapshot.
  useEffect(() => {
    if (isJumpingRef.current) {
      isJumpingRef.current = false
      lastSnapshotRef.current = state
      return
    }
    const prev = lastSnapshotRef.current
    if (prev === state) return
    // Only snapshot when something other than `view` differs from prev.
    const sameView = prev.view === state.view
    const otherChanged =
      prev.theme !== state.theme ||
      prev.layers !== state.layers ||
      prev.title !== state.title ||
      prev.font !== state.font ||
      prev.markers !== state.markers ||
      prev.gpx !== state.gpx ||
      prev.layout !== state.layout ||
      prev.exportSettings !== state.exportSettings
    if (otherChanged || !sameView) {
      undoRef.current.push(prev)
      if (undoRef.current.length > HISTORY_LIMIT) undoRef.current.shift()
      redoRef.current = []
    }
    lastSnapshotRef.current = state
  }, [state])

  const undo = useCallback(() => {
    const prev = undoRef.current.pop()
    if (!prev) return
    redoRef.current.push(lastSnapshotRef.current)
    if (redoRef.current.length > HISTORY_LIMIT) redoRef.current.shift()
    isJumpingRef.current = true
    // Replace state via a synthetic RESET-like dispatch: reducer doesn't have
    // a SET_ALL action, so we bypass by splicing the reducer's state through
    // a custom action. Simplest: dispatch resets then re-apply via setState.
    // We use the trick of dispatching RESET then quickly bringing the prev
    // back using a private __SET marker would be ugly. Instead, replace via
    // window event handled below.
    window.dispatchEvent(new CustomEvent('mtp:set-state', { detail: prev }))
  }, [])

  const redo = useCallback(() => {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(lastSnapshotRef.current)
    if (undoRef.current.length > HISTORY_LIMIT) undoRef.current.shift()
    isJumpingRef.current = true
    window.dispatchEvent(new CustomEvent('mtp:set-state', { detail: next }))
  }, [])

  // Listen for the synthetic state replacement event and dispatch a RESET
  // followed by per-field SETs to reconstruct. (Simpler alternative below.)
  useEffect(() => {
    function onSet(e: Event) {
      const target = (e as CustomEvent<PosterState>).detail
      if (!target) return
      // Reducer route: dispatch a special hydration action handled below.
      dispatch({ type: 'HYDRATE', state: target } as unknown as PosterAction)
    }
    window.addEventListener('mtp:set-state', onSet)
    return () => window.removeEventListener('mtp:set-state', onSet)
  }, [])

  // Keyboard shortcuts: Cmd/Ctrl-Z, Cmd/Ctrl-Shift-Z (or Y).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const canUndo = undoRef.current.length > 0
  const canRedo = redoRef.current.length > 0
  const value = useMemo(
    () => ({ state, dispatch, undo, redo, canUndo, canRedo }),
    [state, undo, redo, canUndo, canRedo],
  )
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
