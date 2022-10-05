import { cloneDeep } from 'lodash'
import {
  ADD_PLACE,
  EDIT_PLACE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  ADD_PLACE_WITH_VALUES,
  ATTACH_PLACE_TO_CARD,
  REMOVE_PLACE_FROM_CARD,
  ATTACH_PLACE_TO_NOTE,
  REMOVE_PLACE_FROM_NOTE,
  DELETE_NOTE,
  DELETE_CARD,
  DELETE_PLACE,
  DELETE_IMAGE,
  EDIT_PLACES_ATTRIBUTE,
  ATTACH_TAG_TO_PLACE,
  REMOVE_TAG_FROM_PLACE,
  ATTACH_BOOK_TO_PLACE,
  REMOVE_BOOK_FROM_PLACE,
  DELETE_TAG,
  LOAD_PLACES,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  DUPLICATE_PLACE,
  DELETE_PLACE_CATEGORY,
} from '../constants/ActionTypes'
import { place } from '../store/initialState'
import { newFilePlaces } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'

const initialState = [place]

const places =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)
    switch (action.type) {
      case ADD_PLACE:
        return [
          ...state,
          {
            ...place,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
          },
        ]

      case ADD_PLACE_WITH_VALUES:
        return [
          ...state,
          {
            ...place,
            ...action.place,
            id: nextId(state),
          },
        ]

      case EDIT_PLACE:
        return state.map((place) =>
          place.id === action.id ? Object.assign({}, place, action.attributes) : place
        )

      case EDIT_PLACE_TEMPLATE_ATTRIBUTE: {
        return state.map((place) => {
          if (place.id === action.id) {
            return {
              ...place,
              templates: place.templates.map((template) => {
                if (template.id === action.templateId) {
                  return {
                    ...template,
                    [action.name]: action.value,
                  }
                }
                return template
              }),
            }
          }
          return place
        })
      }

      case EDIT_PLACES_ATTRIBUTE:
        if (
          action.oldAttribute.type != 'text' &&
          action.oldAttribute.name == action.newAttribute.name
        )
          return state

        return state.map((p) => {
          let pl = cloneDeep(p)

          if (action.oldAttribute.name != action.newAttribute.name) {
            // Firebase doesn't support undefined, so use null when the attribute isn't set
            pl[action.newAttribute.name] = pl[action.oldAttribute.name] || null
            delete pl[action.oldAttribute.name]
          }

          // reset value to blank string
          // (if changing to something other than text type)
          // see ../selectors/customAttributes.js for when this is allowed
          if (action.oldAttribute.type == 'text') {
            let desc = pl[action.newAttribute.name]
            if (!desc || (desc && desc.length && typeof desc !== 'string')) {
              desc = ''
            }
            pl[action.newAttribute.name] = desc
          }
          return pl
        })

      case ATTACH_PLACE_TO_CARD:
        return state.map((place) => {
          let cards = cloneDeep(place.cards)
          cards.push(action.id)
          return place.id === action.placeId ? Object.assign({}, place, { cards: cards }) : place
        })

      case REMOVE_PLACE_FROM_CARD:
        return state.map((place) => {
          let cards = cloneDeep(place.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return place.id === action.placeId ? Object.assign({}, place, { cards: cards }) : place
        })

      case ATTACH_PLACE_TO_NOTE:
        return state.map((place) => {
          let notes = cloneDeep(place.noteIds)
          notes.push(action.id)
          return place.id === action.placeId ? Object.assign({}, place, { noteIds: notes }) : place
        })

      case REMOVE_PLACE_FROM_NOTE:
        return state.map((place) => {
          let notes = cloneDeep(place.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return place.id === action.placeId ? Object.assign({}, place, { noteIds: notes }) : place
        })

      case ATTACH_TAG_TO_PLACE:
        return state.map((place) => {
          let tags = cloneDeep(place.tags)
          tags.push(action.tagId)
          return place.id === action.id ? Object.assign({}, place, { tags: tags }) : place
        })

      case REMOVE_TAG_FROM_PLACE:
        return state.map((place) => {
          let tags = cloneDeep(place.tags)
          tags.splice(tags.indexOf(action.tagId), 1)
          return place.id === action.id ? Object.assign({}, place, { tags: tags }) : place
        })

      case DELETE_TAG:
        return state.map((place) => {
          if (place.tags.includes(action.id)) {
            let tags = cloneDeep(place.tags)
            tags.splice(tags.indexOf(action.id), 1)
            return Object.assign({}, place, { tags: tags })
          } else {
            return place
          }
        })

      case ATTACH_BOOK_TO_PLACE:
        return state.map((place) => {
          let bookIds = cloneDeep(place.bookIds)
          bookIds.push(action.bookId)
          return place.id === action.id ? Object.assign({}, place, { bookIds: bookIds }) : place
        })

      case REMOVE_BOOK_FROM_PLACE:
        return state.map((place) => {
          let bookIds = cloneDeep(place.bookIds)
          bookIds.splice(bookIds.indexOf(action.bookId), 1)
          return place.id === action.id ? Object.assign({}, place, { bookIds: bookIds }) : place
        })

      case DELETE_NOTE:
        return state.map((place) => {
          let notes = cloneDeep(place.noteIds)
          if (!notes) return place
          notes.splice(notes.indexOf(action.id), 1)
          return Object.assign({}, place, { noteIds: notes })
        })

      case DELETE_CARD:
        return state.map((place) => {
          let cards = cloneDeep(place.cards)
          if (!cards) return place
          cards.splice(cards.indexOf(action.id), 1)
          return Object.assign({}, place, { cards: cards })
        })

      case DELETE_PLACE:
        return state.filter((place) => place.id !== action.id)

      case DELETE_IMAGE:
        return state.map((pl) => {
          if (action.id == pl.imageId) {
            return {
              ...pl,
              imageId: null,
            }
          } else {
            return pl
          }
        })

      case DELETE_PLACE_CATEGORY: {
        return state.map((place) => {
          // In one case the ids are strings and the other they are numbers
          // so just to be safe string them both
          if (String(place.categoryId) !== String(action.category.id)) {
            return place
          }

          return {
            ...place,
            categoryId: null,
          }
        })
      }

      case RESET:
      case FILE_LOADED:
        return action.data.places.map((place) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...place,
            ...applyToCustomAttributes(
              place,
              normalizeRCEContent,
              action.data.customAttributes.places,
              'paragraph'
            ),
            notes: normalizeRCEContent(place.notes),
          }
        })

      case NEW_FILE:
        return newFilePlaces

      case LOAD_PLACES:
        return action.places

      case DUPLICATE_PLACE: {
        const itemToDuplicate = state.find(({ id }) => id === action.id)
        if (!itemToDuplicate) {
          return state
        }
        const duplicated = {
          ...cloneDeep(itemToDuplicate),
          id: nextId(state),
        }
        return [...state, { ...duplicated }]
      }

      default:
        return state
    }
  }

export default places
