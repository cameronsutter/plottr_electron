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
import * as tourActions from './actions/tours'
import * as errorActions from './actions/error'
import * as permissionActions from './actions/permission'
import * as projectActions from './actions/project'
import * as clientActions from './actions/client'
import * as editorActions from './actions/editors'
import * as licenseActions from './actions/license'
import * as knownFilesActions from './actions/knownFiles'

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
import * as colorHelpers from './helpers/colors'
import * as editorHelpers from './helpers/editors'

import * as template from './template'

import migrateIfNeeded from './migrator/migration_manager'

import * as bookSelectors from './selectors/books'
import * as cardSelectors from './selectors/cards'
import * as categorySelectors from './selectors/categories'
import * as beatSelectors from './selectors/beats'
import * as characterSelectors from './selectors/characters'
import * as customAttributeSelectors from './selectors/customAttributes'
import * as fileSelectors from './selectors/file'
import * as lineSelectors from './selectors/lines'
import * as notesSelectors from './selectors/notes'
import * as placeSelectors from './selectors/places'
import * as tagSelectors from './selectors/tags'
import * as uiSelectors from './selectors/ui'
import * as hierarchySelectors from './selectors/hierarchy'
import * as hierarchyLevelSelectors from './selectors/hierarchyLevel'
import * as featureFlagSelectors from './selectors/featureFlags'
import * as tourSelector from './selectors/tours'
import * as errorSelectors from './selectors/error'
import * as permissionSelectors from './selectors/permission'
import * as projectSelectors from './selectors/project'
import * as clientSelectors from './selectors/client'
import * as actionSelectors from './selectors/actions'
import * as editorsSelectors from './selectors/editors'
import * as imageSelectors from './selectors/images'
import * as licenseSelectors from './selectors/license'
import * as knownFilesSelectors from './selectors/knownFiles'

import rootReducer from './reducers/root'
import mainReducer from './reducers/main'
import { SYSTEM_REDUCER_KEYS } from './reducers/systemReducers'
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
import tourReducer from './reducers/tours'
import errorReducer from './reducers/error'
import permissionReducer from './reducers/permission'
import clientReducer from './reducers/client'
import editorsReducer from './reducers/editors'
import licenseReducer from './reducers/license'
import knownFilesReducer from './reducers/knownFiles'

import * as initialState from './store/initialState'
import * as lineColors from './store/lineColors'
import { emptyFile } from './store/newFileState'
import * as newIds from './store/newIds'
import * as borderStyle from './store/borderStyle'

import externalSync, { externalSyncWithoutHistory } from './middlewares/externalSync'

import { ARRAY_KEYS } from './middlewares/array-keys'

import * as tree from './reducers/tree'

// Slate serialisers
import serializeToRTF from './slate_serializers/to_rtf'
import { serialize as serializeToPlain } from './slate_serializers/to_plain_text'
import serializeToWord from './slate_serializers/to_word'

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
  tour: tourReducer,
  error: errorReducer,
  permission: permissionReducer,
  client: clientReducer,
  editors: editorsReducer,
  license: licenseReducer,
  knownFiles: knownFilesReducer,
}

const selectors = {
  ...beatSelectors,
  ...bookSelectors,
  ...cardSelectors,
  ...categorySelectors,
  ...characterSelectors,
  ...customAttributeSelectors,
  ...fileSelectors,
  ...lineSelectors,
  ...notesSelectors,
  ...placeSelectors,
  ...tagSelectors,
  ...uiSelectors,
  ...hierarchySelectors,
  ...hierarchyLevelSelectors,
  ...featureFlagSelectors,
  ...tourSelector,
  ...errorSelectors,
  ...permissionSelectors,
  ...projectSelectors,
  ...clientSelectors,
  ...actionSelectors,
  ...editorsSelectors,
  ...imageSelectors,
  ...licenseSelectors,
  ...knownFilesSelectors,
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
  tour: tourActions,
  error: errorActions,
  permission: permissionActions,
  project: projectActions,
  client: clientActions,
  editors: editorActions,
  license: licenseActions,
  knownFiles: knownFilesActions,
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
  colors: colorHelpers,
  editors: editorHelpers,
}

const slate = {
  rtf: { serialize: serializeToRTF },
  word: { serialize: serializeToWord },
  plain: { serialize: serializeToPlain },
}

const middlewares = {
  externalSync,
  externalSyncWithoutHistory,
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
  SYSTEM_REDUCER_KEYS,
  reducers,
  selectors,
  initialState,
  lineColors,
  emptyFile,
  newIds,
  template,
  tree,
  borderStyle,
  slate,
  middlewares,
  ARRAY_KEYS,
}
