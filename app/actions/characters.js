import { ADD_CHARACTER, EDIT_CHARACTER_NAME, EDIT_CHARACTER_DESCRIPTION } from 'constants/ActionTypes'
import { character } from 'store/initialState'

export function addCharacter () {
  return { type: ADD_CHARACTER, name: character.name, description: character.description }
}

export function editCharacterName (id, name) {
  return { type: EDIT_CHARACTER_NAME, id, name }
}

export function editCharacterDescription (id, description) {
  return { type: EDIT_CHARACTER_DESCRIPTION, id, description }
}
