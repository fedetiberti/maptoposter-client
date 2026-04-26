import { DOCK_TABS } from '@/features/dock/data/tabs'
import { useDock } from '@/features/dock/application/DockContext'
import { cn } from '@/lib/utils'

/**
 * Vertical icon rail on the right edge.
 *
 * - 56px wide (52px column + 4px brass indicator on the active tab)
 * - Glass surface with hairline divider
 * - Active state lit by brass color and a left-side rule
 */
export function DockRail() {
  const { activeTab, toggle } = useDock()

  return (
    <nav
      aria-label="Tools"
      className="pointer-events-auto relative z-30 flex w-[56px] flex-col items-stretch gap-px rounded-l-xl border-l border-y border-[var(--rule)] bg-[var(--card)]/70 py-2 backdrop-blur-2xl"
      style={{ boxShadow: '0 24px 48px -12px oklch(0 0 0 / 50%)' }}
    >
      <div className="flex flex-col items-stretch gap-px px-1.5">
        {DOCK_TABS.map(({ id, label, hint, Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              aria-label={label}
              title={`${label} — ${hint}`}
              onClick={() => toggle(id)}
              className={cn(
                'group relative isolate flex aspect-square items-center justify-center rounded-md transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)]',
                isActive
                  ? 'text-[var(--brass)]'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              <Icon size={17} strokeWidth={1.6} />
              {isActive && (
                <>
                  <span
                    className="absolute -left-1.5 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[var(--brass)]"
                    aria-hidden
                  />
                  <span
                    className="absolute inset-0 -z-10 rounded-md"
                    style={{
                      background:
                        'radial-gradient(20px 12px at 50% 50%, color-mix(in oklab, var(--brass) 22%, transparent), transparent 70%)',
                    }}
                    aria-hidden
                  />
                </>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
