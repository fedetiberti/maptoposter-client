import { LAYOUTS, findLayout } from '@/data/layouts'
import {
  exportSize,
  isDpiScalable,
  type Layout,
  type LayoutCategory,
} from '@/features/layout/domain/Layout'
import { resolveExportSize } from '@/features/layout/application/resolveExportSize'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'
import { CustomDimensionsForm } from '@/features/layout/ui/CustomDimensionsForm'

const CATEGORY_LABELS: Record<LayoutCategory, string> = {
  print: 'Print',
  social: 'Social',
  wallpaper: 'Wallpaper',
  web: 'Web',
}

const ORDER: LayoutCategory[] = ['print', 'social', 'wallpaper', 'web']

export function LayoutPicker() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const isCustom = state.layout.kind === 'custom'
  const dpi = state.layout.dpi
  const selectedId = state.layout.kind === 'preset' ? state.layout.presetId : null
  const selectedLayout = selectedId ? findLayout(selectedId) : undefined
  const resolved = resolveExportSize(state.layout)
  // DPI only changes pixel size for physical (print) layouts and for custom
  // sizes typed in cm / in. Screen presets are fixed-pixel specs.
  const dpiMatters = isCustom || (selectedLayout ? isDpiScalable(selectedLayout) : false)
  const groups = ORDER.map((cat) => ({
    cat,
    items: LAYOUTS.filter((l) => l.category === cat),
  }))

  function setDpi(d: number): void {
    dispatch({ type: 'SET_LAYOUT', layout: { ...state.layout, dpi: d } })
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Print resolution
          </h3>
          {!dpiMatters && (
            <span className="text-[10px] text-muted-foreground/60">
              Fixed-pixel preset — DPI only tags the file
            </span>
          )}
        </div>
        <DpiPicker dpi={dpi} onChange={setDpi} muted={!dpiMatters} />
      </div>

      {groups.map(({ cat, items }) => (
        <section key={cat} className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            {CATEGORY_LABELS[cat]}
          </div>
          <div className="grid grid-cols-2 gap-1" role="listbox" aria-label={CATEGORY_LABELS[cat]}>
            {items.map((l) => (
              <LayoutOption
                key={l.id}
                layout={l}
                selected={selectedId === l.id && !isCustom}
                dpi={dpi}
                onSelect={() =>
                  dispatch({
                    type: 'SET_LAYOUT',
                    layout: { kind: 'preset', presetId: l.id, dpi },
                  })
                }
              />
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
          Custom
        </div>
        <CustomDimensionsForm />
      </section>

      <ResolvedSize
        label={isCustom ? 'Custom size' : selectedLayout?.name ?? 'Layout'}
        widthPx={resolved.widthPx}
        heightPx={resolved.heightPx}
        physicalIn={{ w: resolved.physicalWidthIn, h: resolved.physicalHeightIn }}
        dpi={dpi}
      />
    </div>
  )
}

function LayoutOption({
  layout,
  selected,
  dpi,
  onSelect,
}: {
  layout: Layout
  selected: boolean
  dpi: number
  onSelect: () => void
}) {
  const { widthPx, heightPx } = exportSize(layout, dpi)
  const ratio = layout.widthPx / layout.heightPx
  // Tiny aspect-ratio glyph so users can scan orientation at a glance.
  const glyphW = ratio >= 1 ? 14 : Math.max(5, Math.round(14 * ratio))
  const glyphH = ratio >= 1 ? Math.max(5, Math.round(14 / ratio)) : 14
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2 rounded-md border px-2 py-1.5 text-left transition',
        selected
          ? 'border-foreground/80 bg-foreground/10'
          : 'border-border/40 bg-card/30 hover:bg-card/60',
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
        <span
          className={cn('block rounded-[1px] border', selected ? 'border-foreground/80' : 'border-muted-foreground/60')}
          style={{ width: glyphW, height: glyphH }}
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[11px] text-foreground">{layout.name}</span>
        <span className="readout text-[10px] text-muted-foreground">
          {widthPx}×{heightPx}
        </span>
      </span>
    </button>
  )
}

function ResolvedSize({
  label,
  widthPx,
  heightPx,
  physicalIn,
  dpi,
}: {
  label: string
  widthPx: number
  heightPx: number
  physicalIn: { w: number; h: number }
  dpi: number
}) {
  const megapixels = (widthPx * heightPx) / 1_000_000
  return (
    <div className="rounded-md bg-card/30 px-2.5 py-1.5">
      <div className="text-[11px] text-foreground">{label}</div>
      <div className="readout text-[11px] text-muted-foreground">
        {widthPx}×{heightPx} px · {megapixels.toFixed(1)} MP
      </div>
      <div className="readout text-[10px] text-muted-foreground/70">
        {(physicalIn.w * 2.54).toFixed(1)}×{(physicalIn.h * 2.54).toFixed(1)} cm ·{' '}
        {physicalIn.w.toFixed(1)}×{physicalIn.h.toFixed(1)} in @ {dpi} DPI
      </div>
    </div>
  )
}

const DPI_OPTIONS = [72, 150, 300, 400] as const

function DpiPicker({
  dpi,
  onChange,
  muted,
}: {
  dpi: number
  onChange: (d: number) => void
  muted?: boolean
}) {
  return (
    <div
      className={cn('flex items-center gap-1 rounded-full bg-card/40 p-0.5', muted && 'opacity-60')}
      role="radiogroup"
      aria-label="DPI"
    >
      {DPI_OPTIONS.map((d) => (
        <button
          key={d}
          type="button"
          role="radio"
          aria-checked={dpi === d}
          onClick={() => onChange(d)}
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-mono transition',
            dpi === d
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {d}
        </button>
      ))}
    </div>
  )
}
