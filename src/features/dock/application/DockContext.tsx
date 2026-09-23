/* eslint-disable react-refresh/only-export-components -- provider + hook share a file by design */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DockTabId } from '@/features/dock/data/tabs'
import { COMPACT_BREAKPOINT_PX } from '@/features/layout/application/computePreviewBox'

interface DockContextValue {
  activeTab: DockTabId | null
  toggle: (id: DockTabId) => void
  open: (id: DockTabId) => void
  close: () => void
}

const DockContext = createContext<DockContextValue | null>(null)

/** Compact viewports start with the dock closed so the poster is visible first. */
function defaultTab(): DockTabId | null {
  if (typeof window !== 'undefined' && window.innerWidth < COMPACT_BREAKPOINT_PX) return null
  return 'location'
}

export function DockProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: DockTabId | null
}) {
  const [activeTab, setActiveTab] = useState<DockTabId | null>(() =>
    initial === undefined ? defaultTab() : initial,
  )
  const value = useMemo<DockContextValue>(
    () => ({
      activeTab,
      toggle: (id) => setActiveTab((cur) => (cur === id ? null : id)),
      open: (id) => setActiveTab(id),
      close: () => setActiveTab(null),
    }),
    [activeTab],
  )
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>
}

export function useDock(): DockContextValue {
  const ctx = useContext(DockContext)
  if (!ctx) throw new Error('useDock must be used inside <DockProvider>')
  return ctx
}
