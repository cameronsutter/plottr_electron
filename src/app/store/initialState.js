import i18n from 'format-message'
import { INITIAL_ZOOM_INDEX, INITIAL_ZOOM_STATE } from 'constants/zoom_states'
import { remote } from 'electron'
const app = remote.app
i18n.setup({
  translations: require('../../../locales'),
  locale: app.getLocale() || 'en'
})

// data structure

export const scene = {
  id: 1,
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
  id: 1,
  name: '',
  description: '',
  notes: '',
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  categoryId: '',
  imageId: null,
}

export const place = {
  id: 1,
  name: '',
  description: '',
  notes: '',
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  imageId: null,
}

export const tag = {
  id: 1,
  title: '',
  color: null
}

export const card = {
  id: 1,
  lineId: 1,
  sceneId: 1,
  title: i18n('a new card'),
  description: '',
  tags: [],
  characters: [],
  places: [],
  templates: [],
  imageId: null,
}

export const line = {
  id: 1,
  color: '#6cace4',
  title: '',
  position: 0,
}

export const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: []
}

export const note = {
  id: 1,
  title: '',
  content: '',
  tags: [],
  characters: [],
  places: [],
  lastEdited: new Date().getTime(),
  templates: [],
  imageId: null,
}

export const image = {
  id: 1,
  name: '',
  path: '',
  data: '',
}
