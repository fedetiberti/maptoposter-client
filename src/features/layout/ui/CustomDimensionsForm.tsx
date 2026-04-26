import { useState } from 'react'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'

type Unit = 'px' | 'cm' | 'in'

function toPx(value: number, unit: Unit, dpi: number): number {
  if (unit === 'px') return Math.round(value)
  if (unit === 'cm') return Math.round((value / 2.54) * dpi)
  return Math.round(value * dpi)
}

function fromPx(px: number, unit: Unit, dpi: number): number {
  if (unit === 'px') return px
  if (unit === 'cm') return (px / dpi) * 2.54
  return px / dpi
}

export function CustomDimensionsForm() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const dpi = state.layout.dpi
  const isCustom = state.layout.kind === 'custom'
  const [unit, setUnit] = useState<Unit>('cm')

  const widthPx = state.layout.kind === 'custom' ? state.layout.widthPx : 2480
  const heightPx = state.layout.kind === 'custom' ? state.layout.heightPx : 3508

  const w = fromPx(widthPx, unit, dpi)
  const h = fromPx(heightPx, unit, dpi)

  function applyDimensions(nextW: number, nextH: number, nextUnit: Unit): void {
    const widthPxNext = toPx(nextW, nextUnit, dpi)
    const heightPxNext = toPx(nextH, nextUnit, dpi)
    dispatch({
      type: 'SET_LAYOUT',
      layout: {
        kind: 'custom',
        widthPx: Math.max(64, widthPxNext),
        heightPx: Math.max(64, heightPxNext),
        dpi,
      },
    })
  }

  return (
    <div className="space-y-1.5 rounded-md border border-border/40 bg-card/30 p-2">
      <div className="flex items-center gap-1">
        {(['px', 'cm', 'in'] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-mono uppercase transition',
              unit === u
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {u}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          {isCustom ? 'active' : 'click any field to use'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <DimField
          label="W"
          unit={unit}
          value={w}
          onCommit={(v) => applyDimensions(v, h, unit)}
        />
        <DimField
          label="H"
          unit={unit}
          value={h}
          onCommit={(v) => applyDimensions(w, v, unit)}
        />
      </div>
    </div>
  )
}

function DimField({
  label,
  unit,
  value,
  onCommit,
}: {
  label: string
  unit: Unit
  value: number
  onCommit: (v: number) => void
}) {
  const [text, setText] = useState(value.toFixed(unit === 'px' ? 0 : 2))
  const decimals = unit === 'px' ? 0 : 2
  // Sync with external when value changes
  if (parseFloat(text).toFixed(decimals) !== value.toFixed(decimals)) {
    // gentle: only update if user is not currently editing — best-effort.
    queueMicrotask(() => setText(value.toFixed(decimals)))
  }
  return (
    <label className="flex items-center gap-1 rounded border border-border/60 bg-background/60 px-1.5 py-1">
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      <input
        type="number"
        step={unit === 'px' ? 1 : 0.1}
        min={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const n = parseFloat(text)
          if (Number.isFinite(n) && n > 0) onCommit(n)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="w-full min-w-0 bg-transparent font-mono text-[11px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  )
}
