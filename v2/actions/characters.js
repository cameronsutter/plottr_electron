import { ADD_CHARACTER, ADD_CHARACTER_WITH_VALUES,
  ADD_CHARACTER_WITH_TEMPLATE, EDIT_CHARACTER, DELETE_CHARACTER } from '../constants/ActionTypes'
import { character } from '../store/initialState'

export function addCharacter () {
  return { type: ADD_CHARACTER, name: character.name, description: character.description, notes: character.notes  }
}

export function addCharacterWithValues (character) {
  return { type: ADD_CHARACTER_WITH_VALUES, character  }
}

export function addCharacterWithTemplate (templateData) {
  return { type: ADD_CHARACTER_WITH_TEMPLATE, name: character.name, description: character.description, notes: character.notes, templateData  }
}

export function editCharacter (id, attributes) {
  return { type: EDIT_CHARACTER, id, attributes }
}

export function deleteCharacter (id) {
  return { type: DELETE_CHARACTER, id }
}
