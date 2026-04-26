import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDock } from '@/features/dock/application/DockContext'
import { DOCK_TABS, type DockTabId } from '@/features/dock/data/tabs'

interface DockPanelProps {
  id: DockTabId
  children: ReactNode
}

/**
 * Sliding glass panel that hosts the active tab's content.
 * Right-anchored, ~360px wide, decorated with a section-label header.
 */
export function DockPanel({ id, children }: DockPanelProps) {
  const { close, activeTab } = useDock()
  if (activeTab !== id) return null
  const tab = DOCK_TABS.find((t) => t.id === id)
  if (!tab) return null
  return (
    <aside
      key={id}
      role="region"
      aria-label={tab.label}
      className="anim-panel-in glass pointer-events-auto absolute right-[60px] top-3 z-30 flex max-h-[calc(100vh-72px)] w-[360px] flex-col gap-3 overflow-hidden rounded-l-xl rounded-r-md p-4"
    >
      <header className="flex items-center justify-between gap-2 pb-1">
        <div className="flex flex-col gap-0.5">
          <span className="section-label">{tab.label}</span>
          <span className="text-[11px] leading-tight text-muted-foreground/80">
            {tab.hint}
          </span>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close panel"
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        >
          <X size={14} />
        </button>
      </header>
      <div className="hairline" />
      <div className="-mx-1 flex-1 overflow-y-auto px-1 pr-2">{children}</div>
    </aside>
  )
}
