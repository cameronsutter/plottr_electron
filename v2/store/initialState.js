// data structure

export const RCE_INITIAL_VALUE = [{ type: 'paragraph', children: [{ text: '' }] }]

export const series = {
  name: '',
  premise: '',
  genre: '',
  theme: '',
  templates: [],
}

export const book = {
  id: 1,
  title: '',
  premise: '',
  genre: '',
  theme: '',
  templates: [],
  timelineTemplates: [],
  imageId: null,
}

export const beat = {
  id: 1,
  position: 0,
  title: '',
  time: 0, // ? can also be a string
  templates: [],
  autoOutlineSort: true,
}

export const chapter = {
  id: 1,
  bookId: 1,
  position: 0,
  title: 'auto',
  time: 0, // ? can also be a string
  templates: [],
  autoOutlineSort: true,
  fromTemplateId: null,
}

export const ui = {
  currentView: 'timeline',
  currentTimeline: 1, // bookId or 'series'
  timelineIsExpanded: true,
  orientation: 'horizontal',
  darkMode: false,
  characterSort: 'name~asc',
  characterFilter: null,
  placeSort: 'name~asc',
  placeFilter: null,
  noteSort: 'title~asc',
  noteFilter: null,
  timelineFilter: null,
  timelineScrollPosition: {
    x: 0,
    y: 0,
  },
  timeline: {
    size: 'large',
  },
}

export const file = {
  fileName: '',
  loaded: false,
  dirty: false,
  version: '',
}

export const character = {
  id: 1,
  name: '',
  description: '',
  notes: RCE_INITIAL_VALUE,
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  categoryId: null,
  imageId: null,
  bookIds: [],
}

export const categories = {
  characters: [],
  places: [],
  notes: [],
  tags: [],
}

export const category = {
  id: '',
  name: '',
  position: 0,
}

export const place = {
  id: 1,
  name: '',
  description: '',
  notes: RCE_INITIAL_VALUE,
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  imageId: null,
  bookIds: [],
}

export const tag = {
  id: 1,
  title: '',
  color: null,
}

export const card = {
  id: 1,
  lineId: null,
  chapterId: null,
  beatId: null,
  seriesLineId: null,
  bookId: null,
  positionWithinLine: 0,
  positionInChapter: 0,
  title: '',
  description: RCE_INITIAL_VALUE,
  tags: [],
  characters: [],
  places: [],
  templates: [],
  imageId: null,
  fromTemplateId: null,
}

export const line = {
  id: 1,
  bookId: 1,
  color: '#6cace4',
  title: '',
  position: 0,
  characterId: null,
  expanded: null,
  fromTemplateId: null,
}

export const seriesLine = {
  id: 1,
  color: '#6cace4',
  title: '',
  position: 0,
  expanded: null,
}

export const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: [],
}

export const attribute = {
  name: '',
  type: 'text',
}

export const note = {
  id: 1,
  title: '',
  content: RCE_INITIAL_VALUE,
  tags: [],
  characters: [],
  places: [],
  lastEdited: null,
  templates: [],
  imageId: null,
  bookIds: [],
}

export const image = {
  id: 1,
  name: '',
  path: '',
  data: '',
}

// example template for reference
// NOT exported
// const templates = [
//   { id: 'ch1', version: '2020.3.4', attributes: [{ name: 'Motivation', type: 'text', value: '' }] },
// ]
