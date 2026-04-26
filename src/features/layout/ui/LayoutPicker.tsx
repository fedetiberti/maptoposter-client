import { LAYOUTS, findLayout } from '@/data/layouts'
import {
  exportSize,
  type Layout,
  type LayoutCategory,
} from '@/features/layout/domain/Layout'
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
  const groups = ORDER.map((cat) => ({
    cat,
    items: LAYOUTS.filter((l) => l.category === cat),
  }))

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Layout
        </h3>
        <DpiPicker
          dpi={dpi}
          onChange={(d) => {
            if (state.layout.kind === 'preset') {
              dispatch({
                type: 'SET_LAYOUT',
                layout: { kind: 'preset', presetId: state.layout.presetId, dpi: d },
              })
            } else {
              dispatch({
                type: 'SET_LAYOUT',
                layout: {
                  kind: 'custom',
                  widthPx: state.layout.widthPx,
                  heightPx: state.layout.heightPx,
                  dpi: d,
                },
              })
            }
          }}
        />
      </div>

      {groups.map(({ cat, items }) => (
        <section key={cat} className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            {CATEGORY_LABELS[cat]}
          </div>
          <div className="grid grid-cols-2 gap-1">
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

      {state.layout.kind === 'preset' && (
        <ResolvedSize
          label={findLayout(state.layout.presetId)?.name ?? 'Layout'}
          widthPx={
            exportSize(findLayout(state.layout.presetId) ?? LAYOUTS[3]!, dpi).widthPx
          }
          heightPx={
            exportSize(findLayout(state.layout.presetId) ?? LAYOUTS[3]!, dpi).heightPx
          }
          dpi={dpi}
        />
      )}
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-md border px-2 py-1.5 text-left transition',
        selected
          ? 'border-foreground/80 bg-foreground/10'
          : 'border-border/40 bg-card/30 hover:bg-card/60',
      )}
    >
      <span className="truncate text-[11px] text-foreground">{layout.name}</span>
      <span className="text-[10px] font-mono text-muted-foreground">
        {widthPx}×{heightPx}
      </span>
    </button>
  )
}

function ResolvedSize({
  label,
  widthPx,
  heightPx,
  dpi,
}: {
  label: string
  widthPx: number
  heightPx: number
  dpi: number
}) {
  const megapixels = (widthPx * heightPx) / 1_000_000
  return (
    <div className="rounded-md bg-card/30 px-2.5 py-1.5">
      <div className="text-[11px] text-foreground">{label}</div>
      <div className="font-mono text-[11px] text-muted-foreground">
        {widthPx}×{heightPx} px · {megapixels.toFixed(1)} MP @ {dpi} DPI
      </div>
    </div>
  )
}

const DPI_OPTIONS = [72, 150, 300, 400] as const

function DpiPicker({
  dpi,
  onChange,
}: {
  dpi: number
  onChange: (d: number) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-card/40 p-0.5">
      {DPI_OPTIONS.map((d) => (
        <button
          key={d}
          type="button"
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
