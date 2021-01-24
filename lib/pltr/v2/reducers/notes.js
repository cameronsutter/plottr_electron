import { cloneDeep } from 'lodash'
import {
  ADD_NOTE,
  EDIT_NOTE,
  DELETE_NOTE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  ATTACH_CHARACTER_TO_NOTE,
  REMOVE_CHARACTER_FROM_NOTE,
  ATTACH_PLACE_TO_NOTE,
  REMOVE_PLACE_FROM_NOTE,
  ATTACH_TAG_TO_NOTE,
  REMOVE_TAG_FROM_NOTE,
  DELETE_TAG,
  DELETE_CHARACTER,
  DELETE_PLACE,
  DELETE_IMAGE,
  ATTACH_BOOK_TO_NOTE,
  REMOVE_BOOK_FROM_NOTE,
} from '../constants/ActionTypes'
import { note } from '../store/initialState'
import { newFileNotes } from '../store/newFileState'
import { nextId } from '../store/newIds'

const initialState = [note]

export default function notes(state = initialState, action) {
  switch (action.type) {
    case ADD_NOTE:
      return [
        ...state,
        {
          ...note,
          id: nextId(state),
          title: action.title,
          content: action.content,
        },
      ]

    case EDIT_NOTE:
      const lastEdited = { lastEdited: new Date().getTime() }
      return state.map((note) =>
        note.id === action.id ? Object.assign({}, note, action.attributes, lastEdited) : note
      )

    case DELETE_NOTE:
      return state.filter((note) => note.id !== action.id)

    case ATTACH_CHARACTER_TO_NOTE:
      return state.map((note) => {
        let characters = cloneDeep(note.characters)
        characters.push(action.characterId)
        return note.id === action.id ? Object.assign({}, note, { characters: characters }) : note
      })

    case REMOVE_CHARACTER_FROM_NOTE:
      return state.map((note) => {
        let characters = cloneDeep(note.characters)
        characters.splice(characters.indexOf(action.characterId), 1)
        return note.id === action.id ? Object.assign({}, note, { characters: characters }) : note
      })

    case ATTACH_PLACE_TO_NOTE:
      return state.map((note) => {
        let places = cloneDeep(note.places)
        places.push(action.placeId)
        return note.id === action.id ? Object.assign({}, note, { places: places }) : note
      })

    case REMOVE_PLACE_FROM_NOTE:
      return state.map((note) => {
        let places = cloneDeep(note.places)
        places.splice(places.indexOf(action.placeId), 1)
        return note.id === action.id ? Object.assign({}, note, { places: places }) : note
      })

    case ATTACH_TAG_TO_NOTE:
      return state.map((note) => {
        let tags = cloneDeep(note.tags)
        tags.push(action.tagId)
        return note.id === action.id ? Object.assign({}, note, { tags: tags }) : note
      })

    case REMOVE_TAG_FROM_NOTE:
      return state.map((note) => {
        let tags = cloneDeep(note.tags)
        tags.splice(tags.indexOf(action.tagId), 1)
        return note.id === action.id ? Object.assign({}, note, { tags: tags }) : note
      })

    case ATTACH_BOOK_TO_NOTE:
      return state.map((note) => {
        let bookIds = cloneDeep(note.bookIds)
        bookIds.push(action.bookId)
        return note.id === action.id ? Object.assign({}, note, { bookIds: bookIds }) : note
      })

    case REMOVE_BOOK_FROM_NOTE:
      return state.map((note) => {
        let bookIds = cloneDeep(note.bookIds)
        bookIds.splice(bookIds.indexOf(action.bookId), 1)
        return note.id === action.id ? Object.assign({}, note, { bookIds: bookIds }) : note
      })

    case DELETE_TAG:
      return state.map((note) => {
        if (note.tags.includes(action.id)) {
          let tags = cloneDeep(note.tags)
          tags.splice(tags.indexOf(action.id), 1)
          return Object.assign({}, note, { tags: tags })
        } else {
          return note
        }
      })

    case DELETE_CHARACTER:
      return state.map((note) => {
        if (note.characters.includes(action.id)) {
          let characters = cloneDeep(note.characters)
          characters.splice(characters.indexOf(action.id), 1)
          return Object.assign({}, note, { characters: characters })
        } else {
          return note
        }
      })

    case DELETE_PLACE:
      return state.map((note) => {
        if (note.places.includes(action.id)) {
          let places = cloneDeep(note.places)
          places.splice(places.indexOf(action.id), 1)
          return Object.assign({}, note, { places: places })
        } else {
          return note
        }
      })

    case DELETE_IMAGE:
      return state.map((n) => {
        if (action.id == n.imageId) {
          return {
            ...n,
            imageId: null,
          }
        } else {
          return n
        }
      })

    case RESET:
    case FILE_LOADED:
      return action.data.notes || []

    case NEW_FILE:
      return newFileNotes

    default:
      return state
  }
}
