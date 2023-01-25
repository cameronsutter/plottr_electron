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
import * as errorActions from './actions/error'
import * as permissionActions from './actions/permission'
import * as projectActions from './actions/project'
import * as clientActions from './actions/client'
import * as editorActions from './actions/editors'
import * as licenseActions from './actions/license'
import * as knownFilesActions from './actions/knownFiles'
import * as templatesActions from './actions/templates'
import * as settingsActions from './actions/settings'
import * as backupsActions from './actions/backups'
import * as applicationStateActions from './actions/applicationState'
import * as imageCacheActions from './actions/imageCache'
import * as notificationActions from './actions/notifications'
import * as domEventActions from './actions/domEvents'
import * as testingAndDiagnosisActions from './actions/testingAndDiagnosis'
import * as attributeActions from './actions/attributes'

import * as ActionTypes from './constants/ActionTypes'
import * as LoadActions from './constants/loadActions'
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
import * as timeHelpers from './helpers/time'
import * as dateHelpers from './helpers/date'
import * as fileHelpers from './helpers/file'
import * as templatesHelpers from './helpers/templates'

import * as template from './template'

import migrateIfNeeded from './migrator/migration_manager'

import * as selectors from './selectors'

import rootReducer from './reducers/root'
import mainReducer from './reducers/main'
import {
  SYSTEM_REDUCER_KEYS,
  SYSTEM_REDUCER_ACTION_TYPES,
  removeSystemKeys,
} from './reducers/systemReducers'
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
import errorReducer from './reducers/error'
import permissionReducer from './reducers/permission'
import clientReducer from './reducers/client'
import editorsReducer from './reducers/editors'
import licenseReducer from './reducers/license'
import knownFilesReducer from './reducers/knownFiles'
import templatesReducer from './reducers/templates'
import settingsReducer from './reducers/settings'
import backupsReducer from './reducers/backups'
import applicationStateReducer from './reducers/applicationState'
import imageCacheReducer from './reducers/imageCache'
import notificationsReducer from './reducers/notifications'
import domEventsReducer from './reducers/domEvents'
import testingAndDiagnosisReducer from './reducers/testingAndDiagnosis'

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
  error: errorReducer,
  permission: permissionReducer,
  client: clientReducer,
  editors: editorsReducer,
  license: licenseReducer,
  knownFiles: knownFilesReducer,
  templates: templatesReducer,
  settings: settingsReducer,
  backups: backupsReducer,
  applicationState: applicationStateReducer,
  imageCache: imageCacheReducer,
  notifications: notificationsReducer,
  domEvents: domEventsReducer,
  testingAndDiagnosis: testingAndDiagnosisReducer,
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
  error: errorActions,
  permission: permissionActions,
  project: projectActions,
  client: clientActions,
  editors: editorActions,
  license: licenseActions,
  knownFiles: knownFilesActions,
  templates: templatesActions,
  settings: settingsActions,
  backups: backupsActions,
  applicationState: applicationStateActions,
  imageCache: imageCacheActions,
  notifications: notificationActions,
  domEvents: domEventActions,
  testingAndDiagnosis: testingAndDiagnosisActions,
  attributes: attributeActions,
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
  time: timeHelpers,
  date: dateHelpers,
  file: fileHelpers,
  template: templatesHelpers,
}

const slate = {
  rtf: { serialize: serializeToRTF },
  plain: { serialize: serializeToPlain },
}

const middlewares = {
  externalSync,
  externalSyncWithoutHistory,
}

export {
  actions,
  ActionTypes,
  LoadActions,
  helpers,
  colors,
  featureFlags,
  migrateIfNeeded,
  rootReducer,
  mainReducer,
  SYSTEM_REDUCER_KEYS,
  SYSTEM_REDUCER_ACTION_TYPES,
  removeSystemKeys,
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
