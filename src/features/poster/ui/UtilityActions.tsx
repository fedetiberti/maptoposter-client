import { useState } from 'react'
import { Check, Link2, RotateCcw, Undo2, Redo2 } from 'lucide-react'
import { usePoster } from '@/features/poster/application/PosterContext'
import { buildShareUrl } from '@/features/poster/application/shareUrl'
import { clearPersistedState } from '@/features/poster/application/persistState'
import { cn } from '@/lib/utils'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = IS_MAC ? '⌘' : 'Ctrl+'

/**
 * Undo / redo / share / reset. Lives in the top-left cluster next to the brand
 * chip so it never collides with the right-hand dock.
 */
export function UtilityActions() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = usePoster()
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  async function copyShareUrl(): Promise<void> {
    const url = buildShareUrl(state)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Copy this URL:', url)
    }
  }

  function reset(): void {
    if (!confirmReset) {
      setConfirmReset(true)
      window.setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    setConfirmReset(false)
    clearPersistedState()
    dispatch({ type: 'RESET' })
  }

  return (
    <div
      className="glass pointer-events-auto flex items-center gap-0.5 rounded-md p-0.5"
      role="toolbar"
      aria-label="History and sharing"
    >
      <Btn label={`Undo (${MOD}Z)`} disabled={!canUndo} onClick={undo}>
        <Undo2 size={14} />
      </Btn>
      <Btn label={`Redo (⇧${MOD}Z)`} disabled={!canRedo} onClick={redo}>
        <Redo2 size={14} />
      </Btn>
      <span className="mx-0.5 h-4 w-px bg-[var(--rule-strong)]" aria-hidden />
      <Btn label={copied ? 'Link copied' : 'Copy share link'} onClick={copyShareUrl} active={copied}>
        {copied ? <Check size={14} /> : <Link2 size={14} />}
      </Btn>
      <Btn
        label={confirmReset ? 'Click again to reset everything' : 'Reset to defaults'}
        onClick={reset}
        active={confirmReset}
        wide={confirmReset}
      >
        <RotateCcw size={14} />
        {confirmReset && (
          <span className="pr-1 text-[10px] uppercase tracking-[0.14em]">Reset?</span>
        )}
      </Btn>
    </div>
  )
}

function Btn({
  children,
  label,
  onClick,
  disabled,
  active,
  wide,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  wide?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-7 items-center justify-center gap-1 rounded transition',
        wide ? 'px-1.5' : 'w-7',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)]',
        disabled
          ? 'cursor-not-allowed opacity-30'
          : active
            ? 'bg-[var(--brass)]/15 text-[var(--brass)]'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
