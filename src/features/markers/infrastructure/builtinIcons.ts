import type { MarkerIcon } from '@/features/markers/domain/Marker'

/** 12 inline SVG icons. Each uses fill="currentColor" so canvas tinting works. */
export const BUILTIN_ICONS: readonly MarkerIcon[] = [
  {
    id: 'pin',
    name: 'Pin',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>',
  },
  {
    id: 'star',
    name: 'Star',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"/></svg>',
  },
  {
    id: 'heart',
    name: 'Heart',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.5-9.5-9.5C1.4 8.4 3.6 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.4 0 5.6 3.4 4.5 6.5C19.5 16.5 12 21 12 21Z"/></svg>',
  },
  {
    id: 'flag',
    name: 'Flag',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21V3h2v18H5Zm3-3V4l11 5-11 9Z"/></svg>',
  },
  {
    id: 'home',
    name: 'Home',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m12 3 9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8Z"/></svg>',
  },
  {
    id: 'mountain',
    name: 'Mountain',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m14 6-4 6 3 4-7-9 7-1Zm0 0 7 14H3l4-6 6-8 1 0Z"/></svg>',
  },
  {
    id: 'tree',
    name: 'Tree',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 5 12h3l-3 5h4v5h6v-5h4l-3-5h3L12 2Z"/></svg>',
  },
  {
    id: 'anchor',
    name: 'Anchor',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a3 3 0 0 0-1 5.83V10H8v2h3v8c-2.5-.4-4.6-2-5.6-4.3L4 17a8 8 0 0 0 16 0l-1.4-1.3A6.04 6.04 0 0 1 13 20v-8h3v-2h-3V7.83A3 3 0 0 0 12 2Z"/></svg>',
  },
  {
    id: 'plane',
    name: 'Plane',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z"/></svg>',
  },
  {
    id: 'train',
    name: 'Train',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 20.5v.5h12v-.5L16.5 19a3.5 3.5 0 0 0 3.5-3.5V6c0-3.5-4-4-8-4Zm0 2c3.7 0 5.7.4 6 2H6c.3-1.6 2.3-2 6-2Zm-5 5h10v3H7V9Zm1.5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/></svg>',
  },
  {
    id: 'camera',
    name: 'Camera',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M9 4 7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-3H9Zm3 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg>',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    source: 'builtin',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h13a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-1v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4Zm12 2v3h1a1.5 1.5 0 0 0 0-3h-1ZM3 20h18v2H3v-2Z"/></svg>',
  },
] as const
