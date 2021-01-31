// data structure

export const newFileScenes = [
  {
    id: 0,
    title: 'Scene 1',
    position: 0,
  },
]

export const newFileUI = {
  currentView: 'timeline',
  orientation: 'horizontal',
}

export const newFileFile = {
  fileName: '',
  loaded: false,
  dirty: false,
}

export const newFileStoryName = 'My awesome story'

export const newFileCharacters = [
  {
    id: 0,
    name: 'Main Character',
    description: 'the main character',
    notes: '',
    color: null,
    cards: [],
    noteIds: [],
  },
]

export const newFilePlaces = [
  {
    id: 0,
    name: 'First Place',
    description: 'somewhere cool',
    notes: '',
    color: null,
    cards: [],
    noteIds: [],
  },
]

export const newFileTags = [
  {
    id: 0,
    title: 'Happy',
    color: '#ff7f32',
  },
]

export const newFileCards = [
  {
    id: 0,
    lineId: 0,
    sceneId: 0,
    title: 'an empty card',
    description: '',
    tags: [0],
    characters: [],
    places: [],
  },
]

export const newFileLines = [
  {
    id: 0,
    color: '#6cace4',
    title: 'Main Plot',
    position: 0,
  },
]

export const newFileCustomAttributes = {
  characters: ['age'],
  places: [],
  cards: [],
  scenes: [],
  lines: [],
}

export const newFileNotes = [
  {
    id: 0,
    title: 'Note 1',
    content: '',
    tags: [],
    characters: [],
    places: [],
    lastEdited: null,
  },
]
