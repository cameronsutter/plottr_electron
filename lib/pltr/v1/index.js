import rootReducer from './reducers'

import * as initialState from './store/initialState'
import * as lineColors from './store/lineColors'
import * as newFileState from './store/newFileState'
import * as newIds from './store/newIds'

import * as ActionTypes from './constants/ActionTypes'

import * as cardActions from './actions/cards'
import * as characterActions from './actions/characters'
import * as customAttributeActions from './actions/customAttributes'
import * as lineActions from './actions/lines'
import * as noteActions from './actions/notes'
import * as placeActions from './actions/places'
import * as sceneActions from './actions/scenes'
import * as tagActions from './actions/tags'
import * as uiActions from './actions/ui'
import * as undoActions from './actions/undo'

export default {
  rootReducer: rootReducer,
  initialState: initialState,
  lineColors: lineColors,
  newFileState: newFileState,
  newIds: newIds,
  ActionTypes: ActionTypes,
  cardActions: cardActions,
  characterActions: characterActions,
  customAttributeActions: customAttributeActions,
  lineActions: lineActions,
  noteActions: noteActions,
  placeActions: placeActions,
  sceneActions: sceneActions,
  tagActions: tagActions,
  uiActions: uiActions,
  undoActions: undoActions,
}
