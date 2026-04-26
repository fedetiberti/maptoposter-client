import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { DockTabId } from '@/features/dock/data/tabs'

interface DockContextValue {
  activeTab: DockTabId | null
  toggle: (id: DockTabId) => void
  open: (id: DockTabId) => void
  close: () => void
}

const DockContext = createContext<DockContextValue | null>(null)

export function DockProvider({
  children,
  initial = 'location',
}: {
  children: ReactNode
  initial?: DockTabId | null
}) {
  const [activeTab, setActiveTab] = useState<DockTabId | null>(initial)
  const value: DockContextValue = {
    activeTab,
    toggle: (id) => setActiveTab((cur) => (cur === id ? null : id)),
    open: (id) => setActiveTab(id),
    close: () => setActiveTab(null),
  }
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>
}

export function useDock(): DockContextValue {
  const ctx = useContext(DockContext)
  if (!ctx) throw new Error('useDock must be used inside <DockProvider>')
  return ctx
}
