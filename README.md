# maptoposter-client

Print-grade map posters in your browser. A1 at 400 DPI, 35 themes, every layer customizable. No backend.

A client-side React + Vite SPA built on MapLibre GL and OpenFreeMap vector tiles. Sibling project to the original [maptoposter](https://github.com/fedetiberti/maptoposter) Python CLI / FastAPI app.

## Features

- **Live interactive map preview** with bidirectional camera ↔ state sync
- **35 themes** (18 ported from the original maptoposter, 17 originally encoded)
- **16 per-layer color overrides** via inline color pickers
- **11 layer toggles** (buildings, water, parks, roads, etc.)
- **Nominatim search** with debounced autocomplete + manual lat/lon entry that bypasses geocoding
- **27 layout presets** (A1–A5 print, social, wallpaper, web) plus custom dimensions in px / cm / in
- **DPI tabs** at 72 / 150 / 300 / 400, with **tile-render-and-stitch** for sizes that exceed a single GL canvas
- **Title block** with city / divider / country / coordinates and per-line label overrides
- **Font picker** — 8 bundled `@fontsource` families plus ~50 curated Google Fonts loaded on demand
- **Marker system** — drag to place, 12 built-in icons, custom SVG upload (DOMPurify-sanitized) with monochrome tinting
- **GPX track import** with haversine length readout
- **PNG / PDF / SVG export** — PNG includes a hand-rolled `pHYs` chunk so print drivers see the right DPI; PDF is a hand-rolled minimal PDF 1.4
- **PWA** — installable, offline tile cache, service-worker update prompt
- **Shareable URLs** (lz-string compressed state in the hash)
- **Undo / redo** (`⌘Z` / `⇧⌘Z`), debounced localStorage persistence, reset button

## Stack

- Vite 8 · React 19 · TypeScript (strict, `noUncheckedIndexedAccess`)
- Tailwind CSS v4 · shadcn-style design tokens
- MapLibre GL 5.x · OpenFreeMap vector tiles · Nominatim geocoding
- `useReducer` + Context (no global state library)
- vite-plugin-pwa + Workbox

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
npm run typecheck    # tsc --noEmit
npm run preview      # serve dist/
```

## Deploy

Vite is auto-detected by Vercel; push to a GitHub-connected project and it builds. No backend, no environment variables required (defaults point at public Nominatim and OpenFreeMap endpoints; override via `VITE_NOMINATIM_BASE_URL` / `VITE_TILES_BASE_URL`).

## License

MIT.

## Acknowledgements

This is a clean-room re-implementation. The project draws inspiration from [terraink](https://github.com/yousifamanuel/terraink) (AGPL-3.0) but contains no copied code; architecture and feature set are documented in the implementation plan.
