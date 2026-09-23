/* eslint-disable react-refresh/only-export-components -- provider + hooks share a file by design */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
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
  // Stack depths mirrored into React state so `canUndo` / `canRedo` re-render
  // the toolbar the moment a snapshot is pushed (refs alone don't re-render).
  const [depths, setDepths] = useState({ undo: 0, redo: 0 })
  const syncDepths = useCallback(() => {
    setDepths((cur) => {
      const next = { undo: undoRef.current.length, redo: redoRef.current.length }
      return cur.undo === next.undo && cur.redo === next.redo ? cur : next
    })
  }, [])

  // After every render, decide whether to snapshot.
  useEffect(() => {
    if (isJumpingRef.current) {
      isJumpingRef.current = false
      lastSnapshotRef.current = state
      syncDepths()
      return
    }
    const prev = lastSnapshotRef.current
    if (prev === state) return
    // Snapshot when anything the user can perceive changed (view included:
    // a camera move is undoable on purpose, but we skip pure no-op renders).
    const changed =
      prev.view !== state.view ||
      prev.theme !== state.theme ||
      prev.layers !== state.layers ||
      prev.title !== state.title ||
      prev.font !== state.font ||
      prev.markers !== state.markers ||
      prev.gpx !== state.gpx ||
      prev.layout !== state.layout ||
      prev.exportSettings !== state.exportSettings ||
      prev.fadePercent !== state.fadePercent
    if (changed) {
      undoRef.current.push(prev)
      if (undoRef.current.length > HISTORY_LIMIT) undoRef.current.shift()
      redoRef.current = []
    }
    lastSnapshotRef.current = state
    syncDepths()
  }, [state, syncDepths])

  const undo = useCallback(() => {
    const prev = undoRef.current.pop()
    if (!prev) return
    redoRef.current.push(lastSnapshotRef.current)
    if (redoRef.current.length > HISTORY_LIMIT) redoRef.current.shift()
    isJumpingRef.current = true
    dispatch({ type: 'HYDRATE', state: prev })
  }, [])

  const redo = useCallback(() => {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(lastSnapshotRef.current)
    if (undoRef.current.length > HISTORY_LIMIT) undoRef.current.shift()
    isJumpingRef.current = true
    dispatch({ type: 'HYDRATE', state: next })
  }, [])

  // Keyboard shortcuts: Cmd/Ctrl-Z, Cmd/Ctrl-Shift-Z (or Cmd/Ctrl-Y).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (!meta || e.altKey) return
      // Leave text editing to the browser's own undo; sliders, checkboxes and
      // radios have no native undo, so the app-level history applies there.
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        const inputType = tag === 'INPUT' ? (target as HTMLInputElement).type : ''
        const textLike =
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable ||
          (tag === 'INPUT' && !['range', 'checkbox', 'radio', 'button', 'file'].includes(inputType))
        if (textLike) return
      }
      // Shift+Z reports `key === 'Z'`; normalise so ⇧⌘Z actually redoes.
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const canUndo = depths.undo > 0
  const canRedo = depths.redo > 0
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
