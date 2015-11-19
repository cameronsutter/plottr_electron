import { ADD_CHARACTER, EDIT_CHARACTER_NAME, EDIT_CHARACTER_DESCRIPTION, FILE_LOADED } from '../constants/ActionTypes'

const initialState = [{
  id: 0,
  name: '',
  description: ''
}]

export default function characters (state = initialState, action) {
  switch (action.type) {
    case ADD_CHARACTER:
      return [{
        id: state.reduce((maxId, character) => Math.max(character.id, maxId), -1) + 1,
        name: action.name,
        description: action.description
      }, ...state]

    case EDIT_CHARACTER_NAME:
      return state.map(character =>
        character.id === action.id ? Object.assign({}, character, {name: action.name}) : character
      )

    case EDIT_CHARACTER_DESCRIPTION:
      return state.map(character =>
        character.id === action.id ? Object.assign({}, character, {description: action.description}) : character
      )

    case FILE_LOADED:
      return action.data.characters

    default:
      return state
  }
}
