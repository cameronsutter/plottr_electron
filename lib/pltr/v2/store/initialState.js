// data structure

import { nextLevelName } from '../helpers/hierarchy'
import { nextBorderStyle } from './borderStyle'
import { nextColor } from './lineColors'

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
  bookId: 'series',
  position: 0,
  title: 'auto',
  time: 0, // ? can also be a string
  templates: [],
  autoOutlineSort: true,
  fromTemplateId: null,
  expanded: true,
}

export const chapter = {
  id: 2,
  bookId: 1,
  position: 0,
  title: 'auto',
  time: 0, // ? can also be a string
  templates: [],
  autoOutlineSort: true,
  fromTemplateId: null,
  expanded: true,
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
  outlineFilter: null,
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
  beatId: null,
  bookId: null,
  positionWithinLine: 0,
  positionInBeat: 0,
  title: '',
  description: RCE_INITIAL_VALUE,
  tags: [],
  characters: [],
  places: [],
  templates: [],
  imageId: null,
  fromTemplateId: null,
  color: null,
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
  id: 2,
  bookId: 'series',
  color: '#6cace4',
  title: '',
  position: 0,
  characterId: null,
  expanded: null,
  fromTemplateId: null,
}

export const customAttributes = {
  characters: [],
  places: [],
  cards: [],
  scenes: [],
  lines: [],
  notes: [],
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

export const hierarchyLevel = {
  name: nextLevelName(0),
  level: 0,
  autoNumber: true,
  textColor: nextColor(),
  textSize: 24,
  borderColor: nextColor(0),
  borderStyle: nextBorderStyle(0),
  backgroundColor: 'none', // Same as app canvas
}

export const featureFlags = {}

export const tour = {
  showTour: true,
  // feature:{
  //   name:'',
  //   id:0,
  //   endstep:null
  // }, // XXXXXX use this blank object once the user can select the feature to tour
  feature: {
    name: 'acts',
    id: 1,
    endStep: 8,
  },
  run: true,
  //continuous: true, // won't they all be either continuous or not? - may need to include a continuous key/value in the 'feature' object above depending on which feature, some may not be continuous
  stepIndex: 0,
  steps: [],
  loading: false,
  action: 'start',
  transitioning: false,
  b2bTransition: false,
  toursTaken: {},
  // key: new Date(), // may need this to restart tours when more tours are added
}
