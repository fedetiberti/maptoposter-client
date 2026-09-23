import {
  Compass,
  Frame,
  Layers as LayersIcon,
  MapPin,
  Mountain,
  Palette,
  Type,
  Sliders,
  Download,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { THEMES } from '@/data/themes'
import { LAYOUTS } from '@/data/layouts'
import { FONTS } from '@/data/fonts'
import { LAYER_TOGGLE_IDS, THEME_COLOR_KEYS } from '@/features/poster/domain/PosterState'

export type DockTabId =
  | 'location'
  | 'theme'
  | 'layout'
  | 'typography'
  | 'markers'
  | 'gpx'
  | 'layers'
  | 'overrides'
  | 'export'

interface IconProps {
  size?: number
  strokeWidth?: number
}

export interface DockTab {
  id: DockTabId
  label: string
  hint: string
  Icon: ComponentType<IconProps>
}

const bundledFonts = FONTS.filter((f) => f.source === 'bundled').length
const googleFonts = FONTS.length - bundledFonts

/** Hints derive their numbers from the data tables so they can't drift. */
export const DOCK_TABS: readonly DockTab[] = [
  {
    id: 'location',
    label: 'Location',
    hint: 'Search a place or type coordinates · title block',
    Icon: Compass,
  },
  {
    id: 'layout',
    label: 'Layout',
    hint: `${LAYOUTS.length} presets · custom dimensions · DPI`,
    Icon: Frame,
  },
  {
    id: 'theme',
    label: 'Theme',
    hint: `${THEMES.length} themes — pick your starting palette`,
    Icon: Palette,
  },
  {
    id: 'typography',
    label: 'Typography',
    hint: `Title-block font · ${bundledFonts} bundled + ${googleFonts} Google Fonts`,
    Icon: Type,
  },
  {
    id: 'markers',
    label: 'Markers',
    hint: 'Drop pins, choose icons, upload SVGs',
    Icon: MapPin,
  },
  {
    id: 'gpx',
    label: 'GPX',
    hint: 'Trace a route from a .gpx file',
    Icon: Mountain,
  },
  {
    id: 'layers',
    label: 'Layers',
    hint: `${LAYER_TOGGLE_IDS.length} toggles for the OpenMapTiles layer set`,
    Icon: LayersIcon,
  },
  {
    id: 'overrides',
    label: 'Colors',
    hint: `Override any of the ${THEME_COLOR_KEYS.length} theme color keys`,
    Icon: Sliders,
  },
  {
    id: 'export',
    label: 'Export',
    hint: 'PNG · PDF · SVG up to A1 @ 400 DPI',
    Icon: Download,
  },
] as const
