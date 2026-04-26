/**
 * Builds a MapLibre StyleSpecification from a resolved theme + layer toggles.
 * Driven entirely by data — no terraink code is referenced. The structure
 * follows the OpenMapTiles vector schema served by OpenFreeMap.
 */
import type { StyleSpecification, LayerSpecification } from 'maplibre-gl'
import type { ThemeColors } from '@/features/theme/domain/Theme'
import type { LayerToggles } from '@/features/poster/domain/PosterState'

const SOURCE_ID = 'openmaptiles'
const SOURCE_LAYER_LANDCOVER = 'landcover'
const SOURCE_LAYER_PARK = 'park'
const SOURCE_LAYER_WATER = 'water'
const SOURCE_LAYER_WATERWAY = 'waterway'
const SOURCE_LAYER_BUILDING = 'building'
const SOURCE_LAYER_AEROWAY = 'aeroway'
const SOURCE_LAYER_TRANSPORTATION = 'transportation'

const ROAD_MAJOR_CLASSES = ['motorway']
const ROAD_MINOR_HIGH_CLASSES = ['trunk', 'primary', 'secondary']
const ROAD_MINOR_MID_CLASSES = ['tertiary']
const ROAD_MINOR_LOW_CLASSES = ['minor', 'service', 'residential']
const ROAD_PATH_CLASSES = ['path', 'pedestrian', 'cycleway', 'track']
const RAIL_CLASSES = ['rail', 'transit']

function vis(enabled: boolean): 'visible' | 'none' {
  return enabled ? 'visible' : 'none'
}

interface BuildOpts {
  colors: ThemeColors
  layers: LayerToggles
  tilesBaseUrl: string
  showLabels?: boolean
}

export function buildMapStyle({
  colors,
  layers,
  tilesBaseUrl,
}: BuildOpts): StyleSpecification {
  const styleLayers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors['map.land'] },
    },
    {
      id: 'landcover',
      type: 'fill',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_LANDCOVER,
      layout: { visibility: vis(layers.landcover) },
      paint: {
        'fill-color': colors['map.landcover'],
        'fill-antialias': false,
      },
    },
    {
      id: 'park',
      type: 'fill',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_PARK,
      layout: { visibility: vis(layers.parks) },
      paint: { 'fill-color': colors['map.parks'] },
    },
    {
      id: 'water',
      type: 'fill',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_WATER,
      layout: { visibility: vis(layers.water) },
      paint: { 'fill-color': colors['map.water'], 'fill-antialias': true },
    },
    {
      id: 'waterway',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_WATERWAY,
      layout: { visibility: vis(layers.waterway), 'line-cap': 'round' },
      paint: {
        'line-color': colors['map.waterway'],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.4,
          12, 1.2,
          16, 3,
        ],
      },
    },
    {
      id: 'aeroway',
      type: 'fill',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_AEROWAY,
      layout: { visibility: vis(layers.aeroway) },
      paint: { 'fill-color': colors['map.aeroway'] },
    },
    {
      id: 'building',
      type: 'fill',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_BUILDING,
      minzoom: 13,
      layout: { visibility: vis(layers.buildings) },
      paint: {
        'fill-color': colors['map.buildings'],
        'fill-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          13, 0.0,
          14, 0.6,
          16, 1.0,
        ],
      },
    },
    // Road outlines (casing) — drawn under road bodies.
    {
      id: 'road_outline',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: [
        'all',
        ['!=', ['get', 'class'], 'rail'],
        ['!=', ['get', 'class'], 'transit'],
      ],
      minzoom: 11,
      layout: {
        visibility: vis(layers.roads_outline && layers.roads),
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': colors['map.roads.outline'],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          11, 0.6,
          14, 2.2,
          18, 6,
        ],
        'line-gap-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          11, 0.4,
          14, 1.8,
          18, 5.4,
        ],
      },
    },
    {
      id: 'road_path',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: ['in', ['get', 'class'], ['literal', ROAD_PATH_CLASSES]],
      minzoom: 14,
      layout: {
        visibility: vis(layers.roads_path && layers.roads),
        'line-cap': 'round',
      },
      paint: {
        'line-color': colors['map.roads.path'],
        'line-dasharray': [2, 2],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14, 0.4,
          18, 1.4,
        ],
      },
    },
    {
      id: 'road_minor_low',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: ['in', ['get', 'class'], ['literal', ROAD_MINOR_LOW_CLASSES]],
      minzoom: 12,
      layout: {
        visibility: vis(layers.roads_minor_low && layers.roads),
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': colors['map.roads.minor_low'],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 0.3,
          14, 0.9,
          18, 4,
        ],
      },
    },
    {
      id: 'road_minor_mid',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: ['in', ['get', 'class'], ['literal', ROAD_MINOR_MID_CLASSES]],
      minzoom: 10,
      layout: {
        visibility: vis(layers.roads),
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': colors['map.roads.minor_mid'],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 0.4,
          14, 1.4,
          18, 5,
        ],
      },
    },
    {
      id: 'road_minor_high',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: ['in', ['get', 'class'], ['literal', ROAD_MINOR_HIGH_CLASSES]],
      minzoom: 7,
      layout: {
        visibility: vis(layers.roads),
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': colors['map.roads.minor_high'],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 0.5,
          12, 1.6,
          18, 7,
        ],
      },
    },
    {
      id: 'road_major',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: ['in', ['get', 'class'], ['literal', ROAD_MAJOR_CLASSES]],
      minzoom: 5,
      layout: {
        visibility: vis(layers.roads),
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': colors['map.roads.major'],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5, 0.8,
          12, 2.2,
          18, 9,
        ],
      },
    },
    {
      id: 'rail',
      type: 'line',
      source: SOURCE_ID,
      'source-layer': SOURCE_LAYER_TRANSPORTATION,
      filter: ['in', ['get', 'class'], ['literal', RAIL_CLASSES]],
      minzoom: 9,
      layout: {
        visibility: vis(layers.rail),
        'line-cap': 'butt',
        'line-join': 'round',
      },
      paint: {
        'line-color': colors['map.rail'],
        'line-dasharray': [3, 3],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 0.4,
          14, 1.0,
          18, 2.4,
        ],
      },
    },
  ]

  return {
    version: 8,
    name: 'maptoposter',
    glyphs: `${tilesBaseUrl}/fonts/{fontstack}/{range}.pbf`,
    sources: {
      [SOURCE_ID]: {
        type: 'vector',
        url: `${tilesBaseUrl}/planet`,
      },
    },
    layers: styleLayers,
  }
}
