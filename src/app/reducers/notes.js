import { ADD_NOTE, EDIT_NOTE, DELETE_NOTE, FILE_LOADED, NEW_FILE, RESET,
  ADD_CHARACTER_TO_NOTE, REMOVE_CHARACTER_FROM_NOTE, ADD_PLACE_TO_NOTE,
  REMOVE_PLACE_FROM_NOTE, ADD_TAG_TO_NOTE, REMOVE_TAG_FROM_NOTE } from '../constants/ActionTypes'
import { note } from 'store/initialState'
import { newFileNotes } from 'store/newFileState'
import { noteId } from 'store/newIds'

const initialState = [note]

export default function notes (state = initialState, action) {
  switch (action.type) {
    case ADD_NOTE:
      return [...state, {
        id: noteId(state),
        title: action.title,
        content: action.content,
        tags: note.tags,
        characters: note.characters,
        places: note.places,
        lastEdited: note.lastEdited
      }]

    case EDIT_NOTE:
      const lastEdited = {lastEdited: new Date().getTime()}
      return state.map(note =>
        note.id === action.id ? Object.assign({}, note, action.attributes, lastEdited) : note
      )

    case DELETE_NOTE:
      return state.filter(note =>
        note.id !== action.id
      )

    case ADD_CHARACTER_TO_NOTE:
      return state.map(note => {
        let characters = _.cloneDeep(note.characters)
        characters.push(action.characterId)
        return note.id === action.id ? Object.assign({}, note, {characters: characters}) : note
      })

    case REMOVE_CHARACTER_FROM_NOTE:
      return state.map(note => {
        let characters = _.cloneDeep(note.characters)
        characters.splice(characters.indexOf(action.characterId), 1)
        return note.id === action.id ? Object.assign({}, note, {characters: characters}) : note
      })

    case ADD_PLACE_TO_NOTE:
      return state.map(note => {
        let places = _.cloneDeep(note.places)
        places.push(action.placeId)
        return note.id === action.id ? Object.assign({}, note, {places: places}) : note
      })

    case REMOVE_PLACE_FROM_NOTE:
      return state.map(note => {
        let places = _.cloneDeep(note.places)
        places.splice(places.indexOf(action.placeId), 1)
        return note.id === action.id ? Object.assign({}, note, {places: places}) : note
      })

    case ADD_TAG_TO_NOTE:
      return state.map(note => {
        let tags = _.cloneDeep(note.tags)
        tags.push(action.tagId)
        return note.id === action.id ? Object.assign({}, note, {tags: tags}) : note
      })

    case REMOVE_TAG_FROM_NOTE:
      return state.map(note => {
        let tags = _.cloneDeep(note.tags)
        tags.splice(tags.indexOf(action.tagId), 1)
        return note.id === action.id ? Object.assign({}, note, {tags: tags}) : note
      })

    case RESET:
    case FILE_LOADED:
      return action.data.notes

    case NEW_FILE:
      return newFileNotes

    default:
      return state
  }
}
