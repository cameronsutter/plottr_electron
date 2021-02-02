import { ADD_CHARACTER, EDIT_CHARACTER, DELETE_CHARACTER } from '../constants/ActionTypes'
import { character } from '../store/initialState'

export function addCharacter() {
  return {
    type: ADD_CHARACTER,
    name: character.name,
    description: character.description,
    notes: character.notes,
  }
}

export function editCharacter(id, attributes) {
  return { type: EDIT_CHARACTER, id, attributes }
}

export function deleteCharacter(id) {
  return { type: DELETE_CHARACTER, id }
}
