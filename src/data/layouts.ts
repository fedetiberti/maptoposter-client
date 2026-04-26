import type { Layout } from '@/features/layout/domain/Layout'

/** ISO 216 pixel dimensions @ 300 DPI (rounded). */
const A_SERIES_300 = (mmW: number, mmH: number) => ({
  widthPx: Math.round((mmW / 25.4) * 300),
  heightPx: Math.round((mmH / 25.4) * 300),
})

export const LAYOUTS: readonly Layout[] = [
  // Print (7) — paper sizes at 300 DPI
  {
    id: 'a1-portrait',
    name: 'A1 Print',
    category: 'print',
    ...A_SERIES_300(594, 841),
    baseDpi: 300,
    physical: { w: 594, h: 841, unit: 'mm' },
  },
  {
    id: 'a2-portrait',
    name: 'A2 Print',
    category: 'print',
    ...A_SERIES_300(420, 594),
    baseDpi: 300,
    physical: { w: 420, h: 594, unit: 'mm' },
  },
  {
    id: 'a3-portrait',
    name: 'A3 Print',
    category: 'print',
    ...A_SERIES_300(297, 420),
    baseDpi: 300,
    physical: { w: 297, h: 420, unit: 'mm' },
  },
  {
    id: 'a4-portrait',
    name: 'A4 Print',
    category: 'print',
    ...A_SERIES_300(210, 297),
    baseDpi: 300,
    physical: { w: 210, h: 297, unit: 'mm' },
  },
  {
    id: 'a5-portrait',
    name: 'A5 Print',
    category: 'print',
    ...A_SERIES_300(148, 210),
    baseDpi: 300,
    physical: { w: 148, h: 210, unit: 'mm' },
  },
  {
    id: 'letter-us-portrait',
    name: 'US Letter',
    category: 'print',
    widthPx: 2550,
    heightPx: 3300,
    baseDpi: 300,
    physical: { w: 8.5, h: 11, unit: 'in' },
  },
  {
    id: 'tabloid-portrait',
    name: 'US Tabloid',
    category: 'print',
    widthPx: 3300,
    heightPx: 5100,
    baseDpi: 300,
    physical: { w: 11, h: 17, unit: 'in' },
  },

  // Social (10)
  { id: 'ig-square', name: 'Instagram Square', category: 'social', widthPx: 1080, heightPx: 1080, baseDpi: 72 },
  { id: 'ig-portrait', name: 'Instagram Portrait', category: 'social', widthPx: 1080, heightPx: 1350, baseDpi: 72 },
  { id: 'ig-story', name: 'Instagram Story / TikTok', category: 'social', widthPx: 1080, heightPx: 1920, baseDpi: 72 },
  { id: 'linkedin-post', name: 'LinkedIn Post', category: 'social', widthPx: 1200, heightPx: 1200, baseDpi: 72 },
  { id: 'linkedin-cover', name: 'LinkedIn Cover', category: 'social', widthPx: 1584, heightPx: 396, baseDpi: 72 },
  { id: 'pinterest-pin', name: 'Pinterest Pin', category: 'social', widthPx: 1000, heightPx: 1500, baseDpi: 72 },
  { id: 'reddit-post', name: 'Reddit Post', category: 'social', widthPx: 1200, heightPx: 1200, baseDpi: 72 },
  { id: 'reddit-banner', name: 'Reddit Banner', category: 'social', widthPx: 1920, heightPx: 384, baseDpi: 72 },
  { id: 'twitter-header', name: 'Twitter Header', category: 'social', widthPx: 1500, heightPx: 500, baseDpi: 72 },
  { id: 'youtube-thumb', name: 'YouTube Thumbnail', category: 'social', widthPx: 1280, heightPx: 720, baseDpi: 72 },

  // Wallpaper (7)
  { id: 'full-hd', name: 'Full HD', category: 'wallpaper', widthPx: 1920, heightPx: 1080, baseDpi: 72 },
  { id: 'four-k', name: '4K UHD', category: 'wallpaper', widthPx: 3840, heightPx: 2160, baseDpi: 72 },
  { id: 'ultrawide', name: 'Ultrawide 21:9', category: 'wallpaper', widthPx: 3440, heightPx: 1440, baseDpi: 72 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'wallpaper', widthPx: 1179, heightPx: 2556, baseDpi: 72 },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', category: 'wallpaper', widthPx: 1290, heightPx: 2796, baseDpi: 72 },
  { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', category: 'wallpaper', widthPx: 1440, heightPx: 3120, baseDpi: 72 },
  { id: 'ipad-pro-12-9', name: 'iPad Pro 12.9"', category: 'wallpaper', widthPx: 2048, heightPx: 2732, baseDpi: 72 },

  // Web (3)
  { id: 'web-hero', name: 'Hero Banner', category: 'web', widthPx: 2400, heightPx: 800, baseDpi: 72 },
  { id: 'web-blog', name: 'Blog Featured', category: 'web', widthPx: 1200, heightPx: 630, baseDpi: 72 },
  { id: 'web-card', name: 'Dashboard Card', category: 'web', widthPx: 800, heightPx: 600, baseDpi: 72 },
] as const

export function findLayout(id: string): Layout | undefined {
  return LAYOUTS.find((l) => l.id === id)
}
