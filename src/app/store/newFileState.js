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

export const newFileCharacters = []

export const newFilePlaces = []

export const newFileTags = []

export const newFileCards = []

export const newFileLines = [{
  id: 0,
  color: '#6cace4',
  title: i18n('Main Plot'),
  position: 0
}]

export const newFileCustomAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: []
}

export const newFileNotes = []
