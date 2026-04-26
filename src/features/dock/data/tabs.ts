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

export const DOCK_TABS: readonly DockTab[] = [
  {
    id: 'location',
    label: 'Location',
    hint: 'Search a place or drop manual coordinates',
    Icon: Compass,
  },
  {
    id: 'layout',
    label: 'Layout',
    hint: '27 presets · custom dimensions · DPI',
    Icon: Frame,
  },
  {
    id: 'theme',
    label: 'Theme',
    hint: '35 themes — pick your starting palette',
    Icon: Palette,
  },
  {
    id: 'typography',
    label: 'Typography',
    hint: 'Title-block font · 8 bundled + Google Fonts',
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
    hint: '11 toggles for the OpenMapTiles layer set',
    Icon: LayersIcon,
  },
  {
    id: 'overrides',
    label: 'Colors',
    hint: 'Override any of the 16 theme color keys',
    Icon: Sliders,
  },
  {
    id: 'export',
    label: 'Export',
    hint: 'PNG · PDF · SVG up to A1 @ 400 DPI',
    Icon: Download,
  },
] as const
