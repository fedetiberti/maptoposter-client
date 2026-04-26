import {
  DEFAULT_POSTER_STATE,
  type PosterAction,
  type PosterState,
} from '@/features/poster/domain/PosterState'

export function posterReducer(state: PosterState, action: PosterAction): PosterState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: { ...state.view, ...action.view } }

    case 'SET_THEME':
      return {
        ...state,
        theme: { id: action.themeId, overrides: {} },
      }

    case 'SET_THEME_OVERRIDE':
      return {
        ...state,
        theme: {
          ...state.theme,
          overrides: { ...state.theme.overrides, [action.key]: action.value },
        },
      }

    case 'CLEAR_THEME_OVERRIDE': {
      const next = { ...state.theme.overrides }
      delete next[action.key]
      return { ...state, theme: { ...state.theme, overrides: next } }
    }

    case 'CLEAR_ALL_THEME_OVERRIDES':
      return { ...state, theme: { ...state.theme, overrides: {} } }

    case 'SET_LAYER_TOGGLE':
      return {
        ...state,
        layers: { ...state.layers, [action.layer]: action.enabled },
      }

    case 'SET_TITLE':
      return { ...state, title: { ...state.title, ...action.patch } }

    case 'SET_FONT':
      return { ...state, font: action.font }

    case 'ADD_MARKER':
      return { ...state, markers: [...state.markers, action.marker] }

    case 'UPDATE_MARKER':
      return {
        ...state,
        markers: state.markers.map((m) =>
          m.id === action.id ? { ...m, ...action.patch } : m,
        ),
      }

    case 'REMOVE_MARKER':
      return {
        ...state,
        markers: state.markers.filter((m) => m.id !== action.id),
      }

    case 'CLEAR_MARKERS':
      return { ...state, markers: [] }

    case 'SET_GPX':
      return { ...state, gpx: action.gpx }

    case 'SET_LAYOUT':
      return { ...state, layout: action.layout }

    case 'SET_EXPORT':
      return {
        ...state,
        exportSettings: { ...state.exportSettings, ...action.patch },
      }

    case 'SET_REVERSE_GEOCODE_ON_PAN':
      return { ...state, reverseGeocodeOnPan: action.enabled }

    case 'RESET':
      return DEFAULT_POSTER_STATE

    case 'HYDRATE':
      return action.state
  }
}
