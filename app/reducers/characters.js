import { ADD_CHARACTER, EDIT_CHARACTER, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { character } from 'store/initialState'

const initialState = [character]

export default function characters (state = initialState, action) {
  switch (action.type) {
    case ADD_CHARACTER:
      return [{
        id: state.reduce((maxId, character) => Math.max(character.id, maxId), -1) + 1,
        name: action.name,
        description: action.description
      }, ...state]

    case EDIT_CHARACTER:
      return state.map(character =>
        character.id === action.id ? Object.assign({}, character, {name: action.name, description: action.description}) : character
      )

    case FILE_LOADED:
      return action.data.characters

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}
