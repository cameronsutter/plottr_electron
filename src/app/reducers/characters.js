import { ADD_CHARACTER, EDIT_CHARACTER, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { character } from 'store/initialState'
import { characterId } from 'store/newIds'

const initialState = [character]

export default function characters (state = initialState, action) {
  switch (action.type) {
    case ADD_CHARACTER:
      return [...state, {
        id: characterId(state),
        name: action.name,
        description: action.description,
        notes: action.notes,
        color: character.color
      }]

    case EDIT_CHARACTER:
      return state.map(character =>
        character.id === action.id ? Object.assign({}, character, {name: action.name, description: action.description, notes: action.notes, color: action.color}) : character
      )

    case RESET:
    case FILE_LOADED:
      return action.data.characters

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}
