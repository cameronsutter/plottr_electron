import i18n from 'format-message'
import { INITIAL_ZOOM_INDEX, INITIAL_ZOOM_STATE } from 'constants/zoom_states'
import { remote } from 'electron'
const app = remote.app
i18n.setup({
  translations: require('../../../locales'),
  locale: app.getLocale() || 'en'
})

export const RCE_INITIAL_VALUE = [{ children: [{ text: '' }] }]

// data structure

export const scene = {
  id: 0,
  title: '',
  position: 0
}

export const ui = {
  currentView: 'timeline',
  orientation: 'horizontal',
  darkMode: false,
  characterSort: 'name~asc',
  characterFilter: null,
  placeSort: 'name~asc',
  placeFilter: null,
  noteSort: 'title~asc',
  noteFilter: null,
  zoomState: INITIAL_ZOOM_STATE,
  zoomIndex: INITIAL_ZOOM_INDEX,
}

export const file = {
  fileName: '',
  loaded: false,
  dirty: false
}

export const storyName = i18n('My awesome story')

export const character = {
  id: 0,
  name: '',
  description: '',
  notes: RCE_INITIAL_VALUE,
  color: null,
  cards: [],
  noteIds: []
}

export const place = {
  id: 0,
  name: '',
  description: '',
  notes: RCE_INITIAL_VALUE,
  color: null,
  cards: [],
  noteIds: []
}

export const tag = {
  id: 0,
  title: '',
  color: null
}

export const card = {
  id: 0,
  lineId: 0,
  sceneId: 0,
  title: i18n('a new card'),
  description: RCE_INITIAL_VALUE,
  tags: [],
  characters: [],
  places: []
}

export const line = {
  id: 0,
  color: '#6cace4',
  title: '',
  position: 0
}

export const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: []
}

export const note = {
  id: 0,
  title: '',
  content: RCE_INITIAL_VALUE,
  tags: [],
  characters: [],
  places: [],
  lastEdited: new Date().getTime()
}
