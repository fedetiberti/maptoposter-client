import { useState } from 'react'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { TILED_MAX_SIDE } from '@/features/export/application/exportPipeline'
import { cn } from '@/lib/utils'

type Unit = 'px' | 'cm' | 'in'

const MIN_PX = 64

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

function format(value: number, unit: Unit): string {
  return unit === 'px' ? String(Math.round(value)) : value.toFixed(2)
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
  const maxInUnit = fromPx(TILED_MAX_SIDE, unit, dpi)

  function applyDimensions(nextW: number, nextH: number): void {
    const clamp = (px: number) => Math.min(TILED_MAX_SIDE, Math.max(MIN_PX, px))
    dispatch({
      type: 'SET_LAYOUT',
      layout: {
        kind: 'custom',
        widthPx: clamp(toPx(nextW, unit, dpi)),
        heightPx: clamp(toPx(nextH, unit, dpi)),
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
            aria-pressed={unit === u}
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
          {isCustom ? 'active' : 'edit a field to use'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <DimField
          key={`w-${unit}`}
          label="W"
          unit={unit}
          value={w}
          max={maxInUnit}
          onCommit={(v) => applyDimensions(v, h)}
        />
        <DimField
          key={`h-${unit}`}
          label="H"
          unit={unit}
          value={h}
          max={maxInUnit}
          onCommit={(v) => applyDimensions(w, v)}
        />
      </div>
      {unit !== 'px' && (
        <p className="text-[10px] text-muted-foreground/70">
          Converted at {dpi} DPI · max {format(maxInUnit, unit)} {unit} per side
        </p>
      )}
    </div>
  )
}

function DimField({
  label,
  unit,
  value,
  max,
  onCommit,
}: {
  label: string
  unit: Unit
  value: number
  max: number
  onCommit: (v: number) => void
}) {
  const external = format(value, unit)
  const [text, setText] = useState(external)
  // Adopt external changes (preset switch, undo…) without clobbering what the
  // user is typing: only when the *external* value moves do we resync.
  const [seen, setSeen] = useState(external)
  if (seen !== external) {
    setSeen(external)
    setText(external)
  }

  function commit(): void {
    const n = parseFloat(text)
    if (Number.isFinite(n) && n > 0) onCommit(n)
    else setText(external)
  }

  return (
    <label className="flex items-center gap-1 rounded border border-border/60 bg-background/60 px-1.5 py-1 focus-within:ring-1 focus-within:ring-ring">
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={unit === 'px' ? 1 : 0.1}
        min={unit === 'px' ? 64 : 0.1}
        max={max}
        value={text}
        aria-label={`${label === 'W' ? 'Width' : 'Height'} in ${unit}`}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="w-full min-w-0 bg-transparent font-mono text-[11px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-[9px] font-mono text-muted-foreground/60">{unit}</span>
    </label>
  )
}
