import * as beatActions from './actions/beats'
import * as bookActions from './actions/books'
import * as cardActions from './actions/cards'
import * as categoryActions from './actions/categories'
import * as characterActions from './actions/characters'
import * as customAttributeActions from './actions/customAttributes'
import * as imageActions from './actions/images'
import * as lineActions from './actions/lines'
import * as noteActions from './actions/notes'
import * as placeActions from './actions/places'
import * as sceneActions from './actions/scenes'
import * as seriesActions from './actions/series'
import * as seriesLineActions from './actions/seriesLines'
import * as tagActions from './actions/tags'
import * as uiActions from './actions/ui'
import * as undoActions from './actions/undo'

import * as ActionTypes from './constants/ActionTypes'
import * as colors from './constants/CSScolors'

import * as lineHelpers from './helpers/lines'
import * as cardHelpers from './helpers/cards'
import * as chapterHelpers from './helpers/chapters'
import * as listHelpers from './helpers/lists'
import * as fontHelpers from './helpers/fonts'
import * as imageHelpers from './helpers/images'
import * as orientedClassNameHelpers from './helpers/orientedClassName'
import * as undoHelpers from './helpers/undo'

import migrateIfNeeded from './migrator/migration_manager'

import * as beatSelectors from './selectors/beats'
import * as bookSelectors from './selectors/books'
import * as cardSelectors from './selectors/cards'
import * as categorySelectors from './selectors/categories'
import * as chapterSelectors from './selectors/chapters'
import * as characterSelectors from './selectors/characters'
import * as customAttributeSelectors from './selectors/customAttributes'
import * as lineSelectors from './selectors/lines'
import * as notesSelectors from './selectors/notes'
import * as placeSelectors from './selectors/places'
import * as seriesLineSelectors from './selectors/seriesLines'
import * as tagSelectors from './selectors/tags'
import * as uiSelectors from './selectors/ui'

import rootReducer from './reducers/root'
import mainReducer from './reducers/main'
import customAttributesReducer from './reducers/customAttributes'
import linesReducer from './reducers/lines'
import beatsReducer from './reducers/beats'
import booksReducer from './reducers/books'
import cardsReducer from './reducers/cards'
import categoriesReducer from './reducers/categories'
import chaptersReducer from './reducers/chapters'
import charactersReducer from './reducers/characters'
import imagesReducer from './reducers/images'
import notesReducer from './reducers/notes'
import placesReducer from './reducers/places'
import seriesReducer from './reducers/series'
import seriesLineReducer from './reducers/seriesLines'
import tagsReducer from './reducers/tags'
import fileReducer from './reducers/file'
import uiReducer from './reducers/ui'

import * as initialState from './store/initialState'
import * as lineColors from './store/lineColors'
import { emptyFile } from './store/newFileState'
import * as newIds from './store/newIds'

const reducers = {
  customAttributes: customAttributesReducer,
  lines: linesReducer,
  beats: beatsReducer,
  books: booksReducer,
  cards: cardsReducer,
  categories: categoriesReducer,
  chapters: chaptersReducer,
  characters: charactersReducer,
  images: imagesReducer,
  notes: notesReducer,
  places: placesReducer,
  series: seriesReducer,
  seriesLines: seriesLineReducer,
  tags: tagsReducer,
  file: fileReducer,
  ui: uiReducer,
}

const selectors = {
  ...beatSelectors,
  ...bookSelectors,
  ...cardSelectors,
  ...categorySelectors,
  ...chapterSelectors,
  ...characterSelectors,
  ...customAttributeSelectors,
  ...lineSelectors,
  ...notesSelectors,
  ...placeSelectors,
  ...seriesLineSelectors,
  ...tagSelectors,
  ...uiSelectors,
}

const actions = {
  beat: beatActions,
  book: bookActions,
  card: cardActions,
  category: categoryActions,
  character: characterActions,
  customAttribute: customAttributeActions,
  image: imageActions,
  line: lineActions,
  note: noteActions,
  place: placeActions,
  scene: sceneActions,
  series: seriesActions,
  seriesLine: seriesLineActions,
  tag: tagActions,
  ui: uiActions,
  undo: undoActions,
}

const helpers = {
  card: cardHelpers,
  chapters: chapterHelpers,
  lists: listHelpers,
  fonts: fontHelpers,
  images: imageHelpers,
  orientedClassName: orientedClassNameHelpers,
  undo: undoHelpers,
  lines: lineHelpers,
}

export {
  actions,
  ActionTypes,
  helpers,
  colors,
  migrateIfNeeded,
  rootReducer,
  mainReducer,
  reducers,
  selectors,
  initialState,
  lineColors,
  emptyFile,
  newIds,
}
