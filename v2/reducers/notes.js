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
  EDIT_NOTES_ATTRIBUTE,
  DELETE_NOTE_CATEGORY,
  LOAD_NOTES,
} from '../constants/ActionTypes'
import { note } from '../store/initialState'
import { newFileNotes } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'

const initialState = [note]

const notes =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)
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

      case EDIT_NOTE: {
        const lastEdited = { lastEdited: new Date().getTime() }
        return state.map((note) =>
          note.id === action.id ? Object.assign({}, note, action.attributes, lastEdited) : note
        )
      }

      case EDIT_NOTES_ATTRIBUTE:
        if (
          action.oldAttribute.type != 'text' &&
          action.oldAttribute.name == action.newAttribute.name
        )
          return state

        return state.map((n) => {
          let note = cloneDeep(n)

          if (action.oldAttribute.name != action.newAttribute.name) {
            note[action.newAttribute.name] = note[action.oldAttribute.name]
            delete note[action.oldAttribute.name]
          }

          // reset value to blank string
          // (if changing to something other than text type)
          // see ../selectors/customAttributes.js for when this is allowed
          if (action.oldAttribute.type == 'text') {
            let desc = note[action.newAttribute.name]
            if (desc && desc.length && typeof desc !== 'string') {
              desc = ''
            }
            note[action.newAttribute.name] = desc
          }
          return note
        })

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

      case DELETE_NOTE_CATEGORY:
        return state.map((note) => {
          // In one case the ids are strings and the other they are numbers
          // so just to be safe string them both
          if (String(note.categoryId) !== String(action.category.id)) {
            return note
          }

          return {
            ...note,
            categoryId: null,
          }
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
      case FILE_LOADED: {
        const notes = action.data.notes || []
        return notes.map((note) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...note,
            description: normalizeRCEContent(note.content),
            ...applyToCustomAttributes(
              note,
              normalizeRCEContent,
              action.data.customAttributes.notes,
              'paragraph'
            ),
          }
        })
      }

      case NEW_FILE:
        return newFileNotes

      case LOAD_NOTES:
        return action.notes

      default:
        return state
    }
  }

export default notes
