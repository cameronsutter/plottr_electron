// data structure

const series = {
  name: '',
  premise: '',
  genre: '',
  theme: '',
  templates: [],
}

const book = {
  id: 1,
  title: '',
  premise: '',
  genre: '',
  theme: '',
  templates: [],
  imageId: null,
}

const beat = {
  id: 1,
  position: 0,
  title: '',
  time: 0, // ? can also be a string
  templates: [],
}

const chapter = {
  id: 1,
  bookId: 1,
  position: 0,
  title: 'auto',
  time: 0, // ? can also be a string
  templates: [],
}

const ui = {
  currentView: 'timeline',
  currentTimeline: 1, // bookId or 'series'
  orientation: 'horizontal',
  darkMode: false,
  characterSort: 'name~asc',
  characterFilter: null,
  placeSort: 'name~asc',
  placeFilter: null,
  noteSort: 'title~asc',
  noteFilter: null,
  zoomState: null,
  zoomIndex: 4,
}

const file = {
  fileName: '',
  loaded: false,
  dirty: false,
  version: '',
}

const character = {
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
  bookIds: [],
}

const place = {
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
  bookIds: [],
}

const tag = {
  id: 1,
  title: '',
  color: null
}

const card = {
  id: 1,
  lineId: null,
  chapterId: null,
  beatId: null,
  seriesLineId: null,
  bookId: null,
  position: 0,
  title: '',
  description: '',
  tags: [],
  characters: [],
  places: [],
  templates: [],
  imageId: null,
}

const line = {
  id: 1,
  bookId: 1,
  color: '#6cace4',
  title: '',
  position: 0,
  characterId: null,
}

const seriesLine = {
  id: 1,
  color: '#6cace4',
  title: '',
  position: 0,
}

const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: []
}

const note = {
  id: 1,
  title: '',
  content: '',
  tags: [],
  characters: [],
  places: [],
  lastEdited: null,
  templates: [],
  imageId: null,
  bookIds: [],
}

const image = {
  id: 1,
  name: '',
  path: '',
  data: '',
}

module.exports = {
  image,
  note,
  customAttributes,
  seriesLine,
  line,
  card,
  tag,
  place,
  character,
  file,
  ui,
  chapter,
  beat,
  book,
  series,
}
