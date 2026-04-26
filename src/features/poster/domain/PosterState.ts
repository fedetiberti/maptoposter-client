export type ThemeColorKey =
  | 'ui.bg'
  | 'ui.text'
  | 'map.land'
  | 'map.landcover'
  | 'map.water'
  | 'map.waterway'
  | 'map.parks'
  | 'map.buildings'
  | 'map.aeroway'
  | 'map.rail'
  | 'map.roads.major'
  | 'map.roads.minor_high'
  | 'map.roads.minor_mid'
  | 'map.roads.minor_low'
  | 'map.roads.path'
  | 'map.roads.outline'

export const THEME_COLOR_KEYS: readonly ThemeColorKey[] = [
  'ui.bg',
  'ui.text',
  'map.land',
  'map.landcover',
  'map.water',
  'map.waterway',
  'map.parks',
  'map.buildings',
  'map.aeroway',
  'map.rail',
  'map.roads.major',
  'map.roads.minor_high',
  'map.roads.minor_mid',
  'map.roads.minor_low',
  'map.roads.path',
  'map.roads.outline',
] as const

export type LayerToggleId =
  | 'landcover'
  | 'buildings'
  | 'water'
  | 'waterway'
  | 'parks'
  | 'aeroway'
  | 'rail'
  | 'roads'
  | 'roads_path'
  | 'roads_minor_low'
  | 'roads_outline'

export const LAYER_TOGGLE_IDS: readonly LayerToggleId[] = [
  'landcover',
  'buildings',
  'water',
  'waterway',
  'parks',
  'aeroway',
  'rail',
  'roads',
  'roads_path',
  'roads_minor_low',
  'roads_outline',
] as const

export interface MapView {
  lat: number
  lon: number
  zoom: number
  bearing: number
  pitch: number
}

export interface ThemeSelection {
  id: string
  overrides: Partial<Record<ThemeColorKey, string>>
}

export type LayerToggles = Record<LayerToggleId, boolean>

export interface TitleState {
  city: string
  country: string
  cityLabel: string | null
  countryLabel: string | null
  showCoordinates: boolean
}

export interface FontSelection {
  id: string
  googleFamily: string | null
  weight: number
}

export interface Marker {
  id: string
  lat: number
  lon: number
  iconId: string
  color: string
  sizePx: number
}

export interface GpxState {
  fileName: string
  geoJson: GeoJSON.LineString
  lengthMeters: number
  color: string | null
}

export type LayoutSelection =
  | { kind: 'preset'; presetId: string; dpi: number }
  | { kind: 'custom'; widthPx: number; heightPx: number; dpi: number }

export type ExportFormat = 'png' | 'pdf' | 'svg'

export interface ExportSettings {
  format: ExportFormat
  dpi: number
  showLabels: boolean
}

export interface PosterState {
  view: MapView
  theme: ThemeSelection
  layers: LayerToggles
  title: TitleState
  font: FontSelection
  markers: Marker[]
  gpx: GpxState | null
  layout: LayoutSelection
  exportSettings: ExportSettings
  reverseGeocodeOnPan: boolean
}

export const DEFAULT_LAYER_TOGGLES: LayerToggles = {
  landcover: true,
  buildings: true,
  water: true,
  waterway: true,
  parks: true,
  aeroway: true,
  rail: true,
  roads: true,
  roads_path: true,
  roads_minor_low: true,
  roads_outline: true,
}

export const DEFAULT_POSTER_STATE: PosterState = {
  view: {
    lat: 35.6762,
    lon: 139.6503,
    zoom: 12.5,
    bearing: 0,
    pitch: 0,
  },
  theme: {
    id: 'noir',
    overrides: {},
  },
  layers: DEFAULT_LAYER_TOGGLES,
  title: {
    city: 'Tokyo',
    country: 'Japan',
    cityLabel: null,
    countryLabel: null,
    showCoordinates: true,
  },
  font: {
    id: 'roboto',
    googleFamily: null,
    weight: 700,
  },
  markers: [],
  gpx: null,
  layout: {
    kind: 'preset',
    presetId: 'a4-portrait',
    dpi: 300,
  },
  exportSettings: {
    format: 'png',
    dpi: 300,
    showLabels: false,
  },
  reverseGeocodeOnPan: false,
}

export type PosterAction =
  | { type: 'SET_VIEW'; view: Partial<MapView> }
  | { type: 'SET_THEME'; themeId: string }
  | { type: 'SET_THEME_OVERRIDE'; key: ThemeColorKey; value: string }
  | { type: 'CLEAR_THEME_OVERRIDE'; key: ThemeColorKey }
  | { type: 'CLEAR_ALL_THEME_OVERRIDES' }
  | { type: 'SET_LAYER_TOGGLE'; layer: LayerToggleId; enabled: boolean }
  | { type: 'SET_TITLE'; patch: Partial<TitleState> }
  | { type: 'SET_FONT'; font: FontSelection }
  | { type: 'ADD_MARKER'; marker: Marker }
  | { type: 'UPDATE_MARKER'; id: string; patch: Partial<Marker> }
  | { type: 'REMOVE_MARKER'; id: string }
  | { type: 'CLEAR_MARKERS' }
  | { type: 'SET_GPX'; gpx: GpxState | null }
  | { type: 'SET_LAYOUT'; layout: LayoutSelection }
  | { type: 'SET_EXPORT'; patch: Partial<ExportSettings> }
  | { type: 'SET_REVERSE_GEOCODE_ON_PAN'; enabled: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: PosterState }
