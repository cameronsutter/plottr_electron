import i18n from 'format-message'
// data structure

export const newFileScenes = [{
  id: 0,
  title: i18n('Scene 1'),
  position: 0
}]

export const newFileUI = {
  currentView: 'timeline',
  orientation: 'horizontal',
  darkMode: false,
}

export const newFileFile = {
  fileName: '',
  loaded: false,
  dirty: false
}

export const newFileStoryName = i18n('My awesome story')

export const newFileCharacters = [{
  id: 0,
  name: i18n('Main Character'),
  description: i18n('the main character'),
  notes: '',
  color: null,
  cards: [],
  noteIds: []
}]

export const newFilePlaces = [{
  id: 0,
  name: i18n('First Place'),
  description: i18n('somewhere cool'),
  notes: '',
  color: null,
  cards: [],
  noteIds: []
}]

export const newFileTags = [{
  id: 0,
  title: i18n('Happy'),
  color: '#ff7f32'
}]

export const newFileCards = [{
  id: 0,
  lineId: 0,
  sceneId: 0,
  title: i18n('an empty card'),
  description: '',
  tags: [0],
  characters: [],
  places: []
}]

export const newFileLines = [{
  id: 0,
  color: '#6cace4',
  title: i18n('Main Plot'),
  position: 0
}]

export const newFileCustomAttributes = {
  characters: [i18n('age')],
  places: [],
  cards: [],
  scenes: [],
  lines: []
}

export const newFileNotes = [{
  id: 0,
  title: i18n('Note 1'),
  content: '',
  tags: [],
  characters: [],
  places: [],
  lastEdited: null
}]
