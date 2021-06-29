import { cloneDeep } from 'lodash'
import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
  ADD_CHARACTER_WITH_VALUES,
  EDIT_CHARACTER,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD,
  ATTACH_CHARACTER_TO_NOTE,
  REMOVE_CHARACTER_FROM_NOTE,
  DELETE_NOTE,
  DELETE_CARD,
  DELETE_CHARACTER,
  DELETE_IMAGE,
  EDIT_CHARACTER_ATTRIBUTE,
  ATTACH_TAG_TO_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  ATTACH_BOOK_TO_CHARACTER,
  REMOVE_BOOK_FROM_CHARACTER,
  DELETE_CHARACTER_CATEGORY,
  LOAD_CHARACTERS,
} from '../constants/ActionTypes'
import { character } from '../store/initialState'
import { newFileCharacters } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'

const initialState = [character]

const characters =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)

    switch (action.type) {
      case ADD_CHARACTER:
        return [
          ...state,
          {
            ...character,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
          },
        ]

      case ADD_CHARACTER_WITH_VALUES:
        return [
          ...state,
          {
            ...character,
            ...action.character,
            id: nextId(state),
          },
        ]

      case ADD_CHARACTER_WITH_TEMPLATE: {
        const templateData = {
          id: action.templateData.id,
          version: action.templateData.version,
          attributes: action.templateData.attributes,
          value: '',
        }
        return [
          ...state,
          {
            ...character,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
            templates: [templateData],
          },
        ]
      }

      case EDIT_CHARACTER:
        return state.map((character) =>
          character.id === action.id ? Object.assign({}, character, action.attributes) : character
        )

      case EDIT_CHARACTER_ATTRIBUTE:
        if (
          action.oldAttribute.type != 'text' &&
          action.oldAttribute.name == action.newAttribute.name
        )
          return state

        return state.map((c) => {
          let ch = cloneDeep(c)

          if (action.oldAttribute.name != action.newAttribute.name) {
            ch[action.newAttribute.name] = ch[action.oldAttribute.name]
            delete ch[action.oldAttribute.name]
          }

          // reset value to blank string
          // (if changing to something other than text type)
          // see ../selectors/customAttributes.js for when this is allowed
          if (action.oldAttribute.type == 'text') {
            let desc = ch[action.newAttribute.name]
            if (desc && desc.length && typeof desc !== 'string') {
              desc = ''
            }
            ch[action.newAttribute.name] = desc
          }
          return ch
        })

      case ATTACH_CHARACTER_TO_CARD:
        return state.map((character) => {
          let cards = cloneDeep(character.cards)
          cards.push(action.id)
          return character.id === action.characterId
            ? Object.assign({}, character, { cards: cards })
            : character
        })

      case REMOVE_CHARACTER_FROM_CARD:
        return state.map((character) => {
          let cards = cloneDeep(character.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return character.id === action.characterId
            ? Object.assign({}, character, { cards: cards })
            : character
        })

      case ATTACH_CHARACTER_TO_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.push(action.id)
          return character.id === action.characterId
            ? Object.assign({}, character, { noteIds: notes })
            : character
        })

      case REMOVE_CHARACTER_FROM_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return character.id === action.characterId
            ? Object.assign({}, character, { noteIds: notes })
            : character
        })

      case ATTACH_TAG_TO_CHARACTER:
        return state.map((character) => {
          let tags = cloneDeep(character.tags)
          tags.push(action.tagId)
          return character.id === action.id
            ? Object.assign({}, character, { tags: tags })
            : character
        })

      case REMOVE_TAG_FROM_CHARACTER:
        return state.map((character) => {
          let tags = cloneDeep(character.tags)
          tags.splice(tags.indexOf(action.tagId), 1)
          return character.id === action.id
            ? Object.assign({}, character, { tags: tags })
            : character
        })

      case ATTACH_BOOK_TO_CHARACTER:
        return state.map((character) => {
          let bookIds = cloneDeep(character.bookIds)
          bookIds.push(action.bookId)
          return character.id === action.id
            ? Object.assign({}, character, { bookIds: bookIds })
            : character
        })

      case REMOVE_BOOK_FROM_CHARACTER:
        return state.map((character) => {
          let bookIds = cloneDeep(character.bookIds)
          bookIds.splice(bookIds.indexOf(action.bookId), 1)
          return character.id === action.id
            ? Object.assign({}, character, { bookIds: bookIds })
            : character
        })

      case DELETE_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return Object.assign({}, character, { noteIds: notes })
        })

      case DELETE_CARD:
        return state.map((character) => {
          let cards = cloneDeep(character.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return Object.assign({}, character, { cards: cards })
        })

      case DELETE_CHARACTER:
        return state.filter((character) => character.id !== action.id)

      case DELETE_IMAGE:
        return state.map((ch) => {
          if (action.id == ch.imageId) {
            return {
              ...ch,
              imageId: null,
            }
          } else {
            return ch
          }
        })

      case RESET:
      case FILE_LOADED:
        return action.data.characters.map((character) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...character,
            notes: normalizeRCEContent(character.notes),
            ...applyToCustomAttributes(
              character,
              normalizeRCEContent,
              action.data.customAttributes.characters,
              'paragraph'
            ),
          }
        })

      case NEW_FILE:
        return newFileCharacters

      case DELETE_CHARACTER_CATEGORY:
        return state.map((character) => {
          // In one case the ids are strings and the other they are numbers
          // so just to be safe string them both
          if (String(character.categoryId) !== String(action.category.id)) {
            return character
          }

          return {
            ...character,
            categoryId: null,
          }
        })

      case LOAD_CHARACTERS:
        return action.characters

      default:
        return state
    }
  }

export default characters
