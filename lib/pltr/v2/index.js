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
import * as seriesActions from './actions/series'
import * as tagActions from './actions/tags'
import * as uiActions from './actions/ui'
import * as undoActions from './actions/undo'
import * as hierarchyActions from './actions/hierarchy'
import * as featureFlagActions from './actions/featureFlags'

import * as ActionTypes from './constants/ActionTypes'
import * as colors from './constants/CSScolors'
import * as featureFlags from './constants/featureFlags'

import * as lineHelpers from './helpers/lines'
import * as cardHelpers from './helpers/cards'
import * as beatHelpers from './helpers/beats'
import * as bookHelpers from './helpers/books'
import * as listHelpers from './helpers/lists'
import * as orientedClassNameHelpers from './helpers/orientedClassName'
import * as hierarchyHelpers from './helpers/hierarchy'
import * as featureFlagHelpers from './helpers/featureFlags'

import * as template from './template'

import migrateIfNeeded from './migrator/migration_manager'

import * as bookSelectors from './selectors/books'
import * as cardSelectors from './selectors/cards'
import * as categorySelectors from './selectors/categories'
import * as beatSelectors from './selectors/beats'
import * as characterSelectors from './selectors/characters'
import * as customAttributeSelectors from './selectors/customAttributes'
import * as lineSelectors from './selectors/lines'
import * as notesSelectors from './selectors/notes'
import * as placeSelectors from './selectors/places'
import * as tagSelectors from './selectors/tags'
import * as uiSelectors from './selectors/ui'
import * as hierarchySelectors from './selectors/hierarchy'
import * as hierarchyLevelSelectors from './selectors/hierarchyLevel'
import * as featureFlagSelectors from './selectors/featureFlags'

import rootReducer from './reducers/root'
import mainReducer from './reducers/main'
import customAttributesReducer from './reducers/customAttributes'
import linesReducer from './reducers/lines'
import beatsReducer from './reducers/beats'
import booksReducer from './reducers/books'
import cardsReducer from './reducers/cards'
import categoriesReducer from './reducers/categories'
import charactersReducer from './reducers/characters'
import imagesReducer from './reducers/images'
import notesReducer from './reducers/notes'
import placesReducer from './reducers/places'
import seriesReducer from './reducers/series'
import tagsReducer from './reducers/tags'
import fileReducer from './reducers/file'
import uiReducer from './reducers/ui'
import hierarchyReducer from './reducers/hierarchy'
import featureFlagReducer from './reducers/featureFlags'

import * as initialState from './store/initialState'
import * as lineColors from './store/lineColors'
import { emptyFile } from './store/newFileState'
import * as newIds from './store/newIds'
import * as borderStyle from './store/borderStyle'

import * as tree from './reducers/tree'

const reducers = {
  customAttributes: customAttributesReducer,
  lines: linesReducer,
  beats: beatsReducer,
  books: booksReducer,
  cards: cardsReducer,
  categories: categoriesReducer,
  characters: charactersReducer,
  images: imagesReducer,
  notes: notesReducer,
  places: placesReducer,
  series: seriesReducer,
  tags: tagsReducer,
  file: fileReducer,
  ui: uiReducer,
  hierarchyLevels: hierarchyReducer,
  featureFlags: featureFlagReducer,
}

const selectors = {
  ...beatSelectors,
  ...bookSelectors,
  ...cardSelectors,
  ...categorySelectors,
  ...characterSelectors,
  ...customAttributeSelectors,
  ...lineSelectors,
  ...notesSelectors,
  ...placeSelectors,
  ...tagSelectors,
  ...uiSelectors,
  ...hierarchySelectors,
  ...hierarchyLevelSelectors,
  ...featureFlagSelectors,
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
  series: seriesActions,
  tag: tagActions,
  ui: uiActions,
  undo: undoActions,
  hierarchyLevels: hierarchyActions,
  featureFlags: featureFlagActions,
}

const helpers = {
  card: cardHelpers,
  beats: beatHelpers,
  books: bookHelpers,
  lists: listHelpers,
  orientedClassName: orientedClassNameHelpers,
  lines: lineHelpers,
  hierarchyLevels: hierarchyHelpers,
  featureFlags: featureFlagHelpers,
}

export {
  actions,
  ActionTypes,
  helpers,
  colors,
  featureFlags,
  migrateIfNeeded,
  rootReducer,
  mainReducer,
  reducers,
  selectors,
  initialState,
  lineColors,
  emptyFile,
  newIds,
  template,
  tree,
  borderStyle,
}
