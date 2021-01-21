import * as beatActions from './actions/beats'
import * as bookActions from './actions/books'
import * as cardActions from './actions/cards'
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

import * as cardHelpers from './helpers/cards'
import * as chapterHelpers from './helpers/chapters'
import * as listHelpers from './helpers/lists'

import migrateIfNeeded from './migrator/migration_manager'

import * as beatSelectors from './selectors/beats'
import * as bookSelectors from './selectors/books'
import * as cardSelectors from './selectors/cards'
import * as categorySelectors from './selectors/categories'
import * as chapterSelectors from './selectors/chapters'
import * as characterSelectors from './selectors/characters'
import * as customAttributeSelectors from './selectors/customAttributes'
import * as lineSelectors from './selectors/lines'
import * as placeSelectors from './selectors/places'
import * as seriesLineSelectors from './selectors/seriesLines'
import * as tagSelectors from './selectors/tags'
import * as uiSelectors from './selectors/ui'

import rootReducer from './reducers/root'
import customAttributesReducer from './reducers/customAttributes'

import * as initialState from './store/initialState'
import * as lineColors from './store/lineColors'
import { emptyFile } from './store/newFileState'
import * as newIds from './store/newIds'

const reducers = {
  customAttributes: customAttributesReducer
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
  ...placeSelectors,
  ...seriesLineSelectors,
  ...tagSelectors,
  ...uiSelectors,
}

const actions = {
  beatActions,
  bookActions,
  cardActions,
  characterActions,
  customAttributeActions,
  imageActions,
  lineActions,
  noteActions,
  placeActions,
  sceneActions,
  seriesActions,
  seriesLineActions,
  tagActions,
  uiActions,
  undoActions,
}

export {
  actions,
  ActionTypes,
  colors,
  cardHelpers,
  chapterHelpers,
  listHelpers,
  migrateIfNeeded,
  rootReducer,
  reducers,
  selectors,
  initialState,
  lineColors,
  emptyFile,
  newIds,
}
