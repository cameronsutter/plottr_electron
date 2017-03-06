import { ADD_CHARACTER_ATTR, ADD_PLACES_ATTR,
  ADD_CARDS_ATTR, ADD_LINES_ATTR,
  ADD_SCENES_ATTR, REMOVE_CHARACTER_ATTR,
  REMOVE_CARDS_ATTR, REMOVE_PLACES_ATTR, REMOVE_LINES_ATTR,
  REMOVE_SCENES_ATTR, RESET, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import { newFileCustomAttributes } from 'store/newFileState'

function characters (state = [], action) {
  switch (action.type) {
    case ADD_CHARACTER_ATTR:
      return [...state, action.attribute]

    case REMOVE_CHARACTER_ATTR:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case NEW_FILE:
      return newFileCustomAttributes['characters']

    case FILE_LOADED:
      return action.data.customAttributes['characters']

    default:
      return state
  }
}

function places (state = [], action) {
  switch (action.type) {
    case ADD_PLACES_ATTR:
      return [...state, action.attribute]

    case REMOVE_PLACES_ATTR:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case NEW_FILE:
      return newFileCustomAttributes['places']

    case FILE_LOADED:
      return action.data.customAttributes['places']

    default:
      return state
  }
}

function cards (state = [], action) {
  switch (action.type) {
    case ADD_CARDS_ATTR:
      return [...state, action.attribute]

    case REMOVE_CARDS_ATTR:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case NEW_FILE:
      return newFileCustomAttributes['cards']

    case FILE_LOADED:
      return action.data.customAttributes['cards']

    default:
      return state
  }
}

function scenes (state = [], action) {
  switch (action.type) {
    case ADD_SCENES_ATTR:
      return [...state, action.attribute]

    case REMOVE_SCENES_ATTR:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case NEW_FILE:
      return newFileCustomAttributes['scenes']

    case FILE_LOADED:
      return action.data.customAttributes['scenes']

    default:
      return state
  }
}

function lines (state = [], action) {
  switch (action.type) {
    case ADD_LINES_ATTR:
      return [...state, action.attribute]

    case REMOVE_LINES_ATTR:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case NEW_FILE:
      return newFileCustomAttributes['lines']

    case FILE_LOADED:
      return action.data.customAttributes['lines']

    default:
      return state
  }
}

const customAttributes = combineReducers({
  characters,
  places,
  cards,
  scenes,
  lines
})

export default customAttributes
