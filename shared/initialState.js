// data structure

const RCE_INITIAL_VALUE = [{ children: [{ text: '' }] }]

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
  timelineTemplates: [],
  imageId: null,
}

const beat = {
  id: 1,
  position: 0,
  title: 'auto',
  time: 0, // ? can also be a string
  templates: [],
  autoOutlineSort: true,
}

const chapter = {
  id: 1,
  bookId: 1,
  position: 0,
  title: 'auto',
  time: 0, // ? can also be a string
  templates: [],
  autoOutlineSort: true,
  fromTemplateId: null,
}

const ui = {
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
  zoomState: null,
  zoomIndex: 4,
  timelineFilter: null,
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

const categories = {
  characters: [],
  places: [],
  notes: [],
  tags: [],
}

const category = {
  id: '',
  name: '',
  position: 0,
}

const place = {
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

const line = {
  id: 1,
  bookId: 1,
  color: '#6cace4',
  title: '',
  position: 0,
  characterId: null,
  expanded: null,
  fromTemplateId: null,
}

const seriesLine = {
  id: 1,
  color: '#6cace4',
  title: '',
  position: 0,
  expanded: null,
}

const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: [],
}

const attribute = {
  name: '',
  type: 'text',
}

const note = {
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

const image = {
  id: 1,
  name: '',
  path: '',
  data: '',
}

// example template for reference
// NOT exported
const templates = [
  {id: 'ch1', version: '2020.3.4', attributes: [
    {name: 'Motivation', type: 'text', value: ''},
  ]}
]

module.exports = {
  image,
  note,
  customAttributes,
  attribute,
  seriesLine,
  line,
  card,
  tag,
  place,
  character,
  categories,
  category,
  file,
  ui,
  chapter,
  beat,
  book,
  series,
  RCE_INITIAL_VALUE,
}
