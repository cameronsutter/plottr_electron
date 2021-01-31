// data structure

export const scene = {
  id: 0,
  title: '',
  position: 0,
}

export const ui = {
  currentView: 'timeline',
  orientation: 'horizontal',
}

export const file = {
  fileName: '',
  loaded: false,
  dirty: false,
}

export const storyName = 'My awesome story'

export const character = {
  id: 0,
  name: '',
  description: '',
  notes: '',
  color: null,
  cards: [],
  noteIds: [],
}

export const place = {
  id: 0,
  name: '',
  description: '',
  notes: '',
  color: null,
  cards: [],
  noteIds: [],
}

export const tag = {
  id: 0,
  title: '',
  color: null,
}

export const card = {
  id: 0,
  lineId: 0,
  sceneId: 0,
  title: 'a new card',
  description: '',
  tags: [],
  characters: [],
  places: [],
}

export const line = {
  id: 0,
  color: '#6cace4',
  title: '',
  position: 0,
}

export const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: [],
}

export const note = {
  id: 0,
  title: '',
  content: '',
  tags: [],
  characters: [],
  places: [],
  lastEdited: new Date().getTime(),
}
