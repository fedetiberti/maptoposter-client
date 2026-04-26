import { useRef, useState, useSyncExternalStore } from 'react'
import { HexColorPicker } from 'react-colorful'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { iconRegistry } from '@/features/markers/infrastructure/IconRegistry'
import { MARKER_DEFAULTS, type MarkerIcon } from '@/features/markers/domain/Marker'
import type { Marker } from '@/features/poster/domain/PosterState'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Upload } from 'lucide-react'

function useIcons(): MarkerIcon[] {
  return useSyncExternalStore(
    (cb) => iconRegistry.subscribe(cb),
    () => iconRegistry.list(),
    () => iconRegistry.list(),
  )
}

export function MarkerEditor() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const icons = useIcons()
  const [activeId, setActiveId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const active = state.markers.find((m) => m.id === activeId) ?? null

  function addAtCenter(): void {
    const marker: Marker = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      lat: state.view.lat,
      lon: state.view.lon,
      iconId: MARKER_DEFAULTS.iconId,
      color: MARKER_DEFAULTS.color,
      sizePx: MARKER_DEFAULTS.size,
    }
    dispatch({ type: 'ADD_MARKER', marker })
    setActiveId(marker.id)
  }

  async function onFile(file: File): Promise<void> {
    setUploadError(null)
    if (!file.type.includes('svg')) {
      setUploadError('Only SVG files are supported')
      return
    }
    try {
      const text = await file.text()
      iconRegistry.addCustom(text, file.name.replace(/\.svg$/i, ''))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Markers
        </h3>
        <button
          type="button"
          onClick={addAtCenter}
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/50 px-2 py-1 text-[11px] hover:bg-card"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {state.markers.length === 0 && (
        <p className="rounded-md border border-dashed border-border/40 bg-card/20 p-3 text-center text-[11px] text-muted-foreground">
          No markers yet. Click <em>Add</em> to drop one at the map center, then drag to position.
        </p>
      )}

      <ul className="space-y-1">
        {state.markers.map((m) => {
          const icon = icons.find((i) => i.id === m.iconId) ?? icons[0]
          const isActive = activeId === m.id
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActiveId(isActive ? null : m.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md border px-2 py-1.5 transition',
                  isActive
                    ? 'border-foreground/80 bg-foreground/10'
                    : 'border-border/40 bg-card/30 hover:bg-card/60',
                )}
              >
                <span
                  className="size-5 shrink-0"
                  style={{ color: m.color }}
                  dangerouslySetInnerHTML={{ __html: icon?.svg ?? '' }}
                />
                <span className="flex flex-1 flex-col items-start text-left">
                  <span className="text-[11px] text-foreground">
                    {icon?.name ?? m.iconId}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {m.lat.toFixed(4)}, {m.lon.toFixed(4)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: 'REMOVE_MARKER', id: m.id })
                    if (activeId === m.id) setActiveId(null)
                  }}
                  className="rounded p-1 text-muted-foreground hover:bg-card hover:text-destructive"
                  aria-label="Remove marker"
                >
                  <Trash2 size={12} />
                </button>
              </button>
            </li>
          )
        })}
      </ul>

      {active && (
        <div className="space-y-2 rounded-md border border-border/40 bg-card/30 p-2">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Icon
            </div>
            <div className="grid grid-cols-6 gap-1">
              {icons.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_MARKER',
                      id: active.id,
                      patch: { iconId: i.id },
                    })
                  }
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-md border transition',
                    active.iconId === i.id
                      ? 'border-foreground/80 bg-foreground/10'
                      : 'border-border/40 bg-card/30 hover:bg-card/70',
                  )}
                  style={{ color: active.color }}
                  title={i.name}
                  dangerouslySetInnerHTML={{ __html: i.svg }}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Color
            </div>
            <HexColorPicker
              color={active.color}
              onChange={(c) =>
                dispatch({ type: 'UPDATE_MARKER', id: active.id, patch: { color: c } })
              }
              style={{ width: '100%', height: 100 }}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Size</span>
              <span className="font-mono normal-case">{active.sizePx}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={96}
              step={1}
              value={active.sizePx}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_MARKER',
                  id: active.id,
                  patch: { sizePx: parseInt(e.target.value, 10) },
                })
              }
              className="w-full accent-foreground"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border/60 bg-card/20 px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-card/50 hover:text-foreground"
        >
          <Upload size={12} />
          Upload custom SVG
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml,.svg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
            e.target.value = ''
          }}
        />
        {uploadError && (
          <p className="text-[10px] text-destructive">{uploadError}</p>
        )}
        {icons.some((i) => i.source === 'custom') && (
          <details>
            <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground">
              Manage custom icons
            </summary>
            <ul className="mt-1 space-y-0.5">
              {icons
                .filter((i) => i.source === 'custom')
                .map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center gap-2 rounded px-1 py-0.5"
                  >
                    <span
                      className="size-4"
                      style={{ color: 'currentColor' }}
                      dangerouslySetInnerHTML={{ __html: i.svg }}
                    />
                    <span className="flex-1 truncate text-[10px]">{i.name}</span>
                    <button
                      type="button"
                      onClick={() => iconRegistry.removeCustom(i.id)}
                      className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                      aria-label="Delete custom icon"
                    >
                      <Trash2 size={10} />
                    </button>
                  </li>
                ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  )
}

