import { useEffect, useMemo, useState } from 'react'
import { FONTS, findFont, type FontDef } from '@/data/fonts'
import { ensureGoogleFont } from '@/core/fonts/ensureGoogleFont'
import {
  usePosterDispatch,
  usePosterState,
} from '@/features/poster/application/PosterContext'
import { cn } from '@/lib/utils'

const CATEGORY_ORDER: FontDef['category'][] = ['display', 'serif', 'sans', 'mono']
const CATEGORY_LABEL: Record<FontDef['category'], string> = {
  display: 'Display',
  serif: 'Serif',
  sans: 'Sans',
  mono: 'Mono',
}

export function FontPicker() {
  const state = usePosterState()
  const dispatch = usePosterDispatch()
  const [filter, setFilter] = useState<'bundled' | 'google' | 'all'>('all')
  const [query, setQuery] = useState('')

  // Pre-load whatever's currently selected so the title block paints with the right family.
  useEffect(() => {
    const f = findFont(state.font.id)
    if (!f || f.source !== 'google' || !f.googleFamily) return
    ensureGoogleFont(f.googleFamily, [state.font.weight]).catch(() => undefined)
  }, [state.font.id, state.font.weight])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FONTS.filter((f) => {
      if (filter !== 'all' && f.source !== filter) return false
      if (q && !f.cssFamily.toLowerCase().includes(q)) return false
      return true
    })
  }, [filter, query])

  const grouped = useMemo(() => {
    const out: Record<FontDef['category'], FontDef[]> = {
      display: [],
      serif: [],
      sans: [],
      mono: [],
    }
    for (const f of filtered) out[f.category].push(f)
    return out
  }, [filtered])

  function pick(font: FontDef): void {
    if (font.source === 'google' && font.googleFamily) {
      ensureGoogleFont(font.googleFamily, font.weights).catch(() => undefined)
    }
    dispatch({
      type: 'SET_FONT',
      font: {
        id: font.id,
        googleFamily: font.googleFamily ?? null,
        weight: font.weights.includes(700)
          ? 700
          : font.weights[font.weights.length - 1] ?? 400,
      },
    })
  }

  return (
    <div className="space-y-2 text-sm">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Typography
      </h3>
      <div className="flex items-center gap-1">
        {(['all', 'bundled', 'google'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider transition',
              filter === f
                ? 'bg-foreground text-background'
                : 'bg-card/40 text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
        <input
          type="search"
          placeholder="filter…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto w-24 rounded-md border border-border/40 bg-background/60 px-2 py-0.5 text-[11px] outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat]
          if (list.length === 0) return null
          return (
            <section key={cat}>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                {CATEGORY_LABEL[cat]}
              </div>
              <ul className="space-y-0.5">
                {list.map((f) => {
                  const selected = state.font.id === f.id
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => pick(f)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left transition',
                          selected
                            ? 'border-foreground/80 bg-foreground/10'
                            : 'border-border/40 bg-card/30 hover:bg-card/60',
                        )}
                      >
                        <span
                          style={{
                            fontFamily: `"${f.cssFamily}", system-ui, sans-serif`,
                            fontWeight: f.weights[f.weights.length - 1] ?? 400,
                            letterSpacing: '0.04em',
                          }}
                          className="truncate text-[13px] text-foreground"
                        >
                          {f.cssFamily}
                        </span>
                        <span className="shrink-0 text-[9px] uppercase tracking-wider text-muted-foreground">
                          {f.source === 'bundled' ? '· bundled' : '· google'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
