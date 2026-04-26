import { useState } from 'react'
import { Link2, RotateCcw, Undo2, Redo2 } from 'lucide-react'
import { usePoster } from '@/features/poster/application/PosterContext'
import { buildShareUrl } from '@/features/poster/application/shareUrl'
import { clearPersistedState } from '@/features/poster/application/persistState'
import { cn } from '@/lib/utils'

export function UtilityActions() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = usePoster()
  const [copied, setCopied] = useState(false)

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
    if (!window.confirm('Reset all customization to defaults?')) return
    clearPersistedState()
    dispatch({ type: 'RESET' })
  }

  return (
    <div className="pointer-events-auto absolute right-3 top-[120px] z-20 flex flex-col items-center gap-1">
      <Btn
        label="Undo (⌘Z)"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 size={14} />
      </Btn>
      <Btn
        label="Redo (⇧⌘Z)"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 size={14} />
      </Btn>
      <Btn
        label={copied ? 'Link copied' : 'Copy share link'}
        onClick={copyShareUrl}
        active={copied}
      >
        <Link2 size={14} />
      </Btn>
      <Btn label="Reset to defaults" onClick={reset}>
        <RotateCcw size={14} />
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
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'glass flex size-8 items-center justify-center rounded-md transition',
        disabled
          ? 'opacity-30'
          : active
            ? 'text-[var(--brass)]'
            : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
