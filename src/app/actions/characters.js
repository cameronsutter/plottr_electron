import { ADD_CHARACTER, EDIT_CHARACTER } from 'constants/ActionTypes'
import { character } from 'store/initialState'

export function addCharacter () {
  return { type: ADD_CHARACTER, name: character.name, description: character.description, notes: character.notes  }
}

export function editCharacter (id, name, description, notes, color) {
  return { type: EDIT_CHARACTER, id, name, description, notes, color }
}
