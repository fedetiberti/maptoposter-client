export interface FontDef {
  id: string
  cssFamily: string
  /** Bundled (already loaded via @fontsource) vs google (lazy-load on demand). */
  source: 'bundled' | 'google'
  /** googleFamily is the actual Google Fonts family name (only set for google). */
  googleFamily?: string
  weights: number[]
  /** Visual category for grouping in the picker. */
  category: 'sans' | 'serif' | 'display' | 'mono'
}

const BUNDLED: FontDef[] = [
  { id: 'inter', cssFamily: 'Inter Variable', source: 'bundled', weights: [400, 600, 700], category: 'sans' },
  { id: 'bebas-neue', cssFamily: 'Bebas Neue', source: 'bundled', weights: [400], category: 'display' },
  { id: 'oswald', cssFamily: 'Oswald', source: 'bundled', weights: [500, 700], category: 'display' },
  { id: 'montserrat', cssFamily: 'Montserrat', source: 'bundled', weights: [500, 700], category: 'sans' },
  { id: 'raleway', cssFamily: 'Raleway', source: 'bundled', weights: [500, 700], category: 'sans' },
  { id: 'lato', cssFamily: 'Lato', source: 'bundled', weights: [400, 700], category: 'sans' },
  { id: 'playfair-display', cssFamily: 'Playfair Display', source: 'bundled', weights: [500, 700], category: 'serif' },
  { id: 'merriweather', cssFamily: 'Merriweather', source: 'bundled', weights: [400, 700], category: 'serif' },
  { id: 'noto-sans-jp', cssFamily: 'Noto Sans JP', source: 'bundled', weights: [500, 700], category: 'sans' },
]

/** Curated subset of popular Google Fonts. Loaded on demand at pick-time. */
const GOOGLE: FontDef[] = [
  // display / poster-friendly
  ...mkGoogle('Abril Fatface', 'display'),
  ...mkGoogle('Anton', 'display'),
  ...mkGoogle('Archivo Black', 'display'),
  ...mkGoogle('Bangers', 'display'),
  ...mkGoogle('Big Shoulders Display', 'display', [400, 800]),
  ...mkGoogle('Cinzel', 'display', [400, 700]),
  ...mkGoogle('Comfortaa', 'display', [400, 700]),
  ...mkGoogle('Cormorant Garamond', 'serif', [400, 700]),
  ...mkGoogle('DM Serif Display', 'serif'),
  ...mkGoogle('Fjalla One', 'display'),
  ...mkGoogle('Forum', 'display'),
  ...mkGoogle('Italianno', 'display'),
  ...mkGoogle('Josefin Sans', 'sans', [400, 700]),
  ...mkGoogle('Kanit', 'sans', [500, 700]),
  ...mkGoogle('Lobster', 'display'),
  ...mkGoogle('Marcellus', 'serif'),
  ...mkGoogle('Permanent Marker', 'display'),
  ...mkGoogle('Pinyon Script', 'display'),
  ...mkGoogle('Russo One', 'display'),
  ...mkGoogle('Six Caps', 'display'),
  ...mkGoogle('Staatliches', 'display'),
  ...mkGoogle('Syne', 'sans', [600, 800]),
  ...mkGoogle('Tenor Sans', 'sans'),
  ...mkGoogle('Yeseva One', 'display'),

  // serif
  ...mkGoogle('Bodoni Moda', 'serif', [500, 800]),
  ...mkGoogle('Crimson Pro', 'serif', [500, 700]),
  ...mkGoogle('EB Garamond', 'serif', [500, 700]),
  ...mkGoogle('Lora', 'serif', [500, 700]),
  ...mkGoogle('Old Standard TT', 'serif', [400, 700]),
  ...mkGoogle('Spectral', 'serif', [500, 800]),

  // sans / utility
  ...mkGoogle('Archivo', 'sans', [500, 700]),
  ...mkGoogle('Barlow', 'sans', [500, 800]),
  ...mkGoogle('Bebas Kai', 'display'),
  ...mkGoogle('DM Sans', 'sans', [500, 700]),
  ...mkGoogle('Manrope', 'sans', [500, 700]),
  ...mkGoogle('Mulish', 'sans', [500, 800]),
  ...mkGoogle('Nunito', 'sans', [500, 800]),
  ...mkGoogle('Outfit', 'sans', [500, 700]),
  ...mkGoogle('Plus Jakarta Sans', 'sans', [500, 700]),
  ...mkGoogle('Poppins', 'sans', [500, 700]),
  ...mkGoogle('Public Sans', 'sans', [500, 700]),
  ...mkGoogle('Rubik', 'sans', [500, 800]),
  ...mkGoogle('Sora', 'sans', [500, 700]),
  ...mkGoogle('Space Grotesk', 'sans', [500, 700]),
  ...mkGoogle('Urbanist', 'sans', [500, 800]),
  ...mkGoogle('Work Sans', 'sans', [500, 700]),

  // mono
  ...mkGoogle('IBM Plex Mono', 'mono', [400, 700]),
  ...mkGoogle('JetBrains Mono', 'mono', [500, 700]),
  ...mkGoogle('Space Mono', 'mono', [400, 700]),
]

function mkGoogle(
  family: string,
  category: FontDef['category'],
  weights: number[] = [400, 700],
): FontDef[] {
  const id = family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return [{ id, cssFamily: family, googleFamily: family, source: 'google', weights, category }]
}

export const FONTS: readonly FontDef[] = [...BUNDLED, ...GOOGLE]

export function findFont(id: string): FontDef | undefined {
  return FONTS.find((f) => f.id === id)
}

export const BUNDLED_IDS = new Set(BUNDLED.map((f) => f.id))
