// data structure

export const scene = {
  id: 0,
  title: 'new scene',
  position: 0
}

export const ui = {
  currentView: 'timeline'
}

export const file = {
  fileName: '',
  loaded: false,
  dirty: false
}

export const storyName = 'My awesome story'

export const character = {
  id: 0,
  name: 'main character',
  description: 'she is the coolest',
  notes: 'this is why she is the coolest',
  color: null
}

export const place = {
  id: 0,
  name: 'first place',
  description: 'my favorite place',
  notes: 'about this place',
  color: null
}

export const tag = {
  id: 0,
  title: 'First tag :)',
  color: null
}

export const card = {
  id: 0,
  lineId: 0,
  sceneId: 0,
  title: 'a new card',
  description: 'add description here',
  tags: [],
  characters: [],
  places: []
}

export const line = {
  id: 0,
  color: '#000000',
  title: 'Story Line',
  position: 0
}
