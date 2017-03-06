import { ADD_CHARACTER, EDIT_CHARACTER, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { character } from 'store/initialState'
import { newFileCharacters } from 'store/newFileState'
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
        character.id === action.id ? Object.assign({}, character, action.attributes) : character
      )

    case RESET:
    case FILE_LOADED:
      return action.data.characters

    case NEW_FILE:
      return newFileCharacters

    default:
      return state
  }
}
