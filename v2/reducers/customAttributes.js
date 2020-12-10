import { ADD_CHARACTER_ATTRIBUTE, ADD_PLACES_ATTRIBUTE,
  ADD_CARDS_ATTRIBUTE, ADD_LINES_ATTRIBUTE,
  ADD_SCENES_ATTRIBUTE, REMOVE_CHARACTER_ATTRIBUTE,
  REMOVE_CARDS_ATTRIBUTE, REMOVE_PLACES_ATTRIBUTE, REMOVE_LINES_ATTRIBUTE,
  REMOVE_SCENES_ATTRIBUTE, EDIT_CHARACTER_ATTRIBUTE, EDIT_PLACES_ATTRIBUTE,
  EDIT_CARDS_ATTRIBUTE, EDIT_LINES_ATTRIBUTE, EDIT_SCENES_ATTRIBUTE,
  RESET, FILE_LOADED, NEW_FILE, REORDER_CHARACTER_ATTRIBUTE,
  REORDER_PLACES_ATTRIBUTE } from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import { newFileCustomAttributes } from '../store/newFileState'

function characters (state = [], action) {
  switch (action.type) {
    case ADD_CHARACTER_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_CHARACTER_ATTRIBUTE: // attribute is the attr's name
      return state.filter(attr => attr.name !== action.attribute)

    case EDIT_CHARACTER_ATTRIBUTE:
      let newState = [...state]
      newState[action.index] = action.newAttribute
      return newState

    case RESET:
    case NEW_FILE:
      return newFileCustomAttributes['characters']

    case FILE_LOADED:
      return action.data.customAttributes['characters']

    case REORDER_CHARACTER_ATTRIBUTE:
      let {
        toIndex,
        attribute,
      } = action;

      const copy = state
        .slice()
        .filter(({ name }) => name != attribute.name);

      copy.splice(toIndex, 0, attribute);
      return copy;

    default:
      return state
  }
}

function places (state = [], action) {
  switch (action.type) {
    case ADD_PLACES_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_PLACES_ATTRIBUTE: // attribute is the attr's name
      return state.filter(attr => attr.name !== action.attribute)

    case EDIT_PLACES_ATTRIBUTE:
      let newState = [...state]
      newState[action.index] = action.newAttribute
      return newState

    case RESET:
    case NEW_FILE:
      return newFileCustomAttributes['places']

    case FILE_LOADED:
      return action.data.customAttributes['places']

    case REORDER_PLACES_ATTRIBUTE:
        let {
          toIndex,
          attribute,
        } = action;

        const copy = state
          .slice()
          .filter(({ name }) => name != attribute.name);

        copy.splice(toIndex, 0, attribute);
        return copy;

    default:
      return state
  }
}

function cards (state = [], action) {
  switch (action.type) {
    case ADD_CARDS_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_CARDS_ATTRIBUTE:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case RESET:
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
    case ADD_SCENES_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_SCENES_ATTRIBUTE:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case RESET:
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
    case ADD_LINES_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_LINES_ATTRIBUTE:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case RESET:
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
