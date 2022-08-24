import { FILE_LOADED } from '../../v1/constants/ActionTypes'
import { CREATE_CHARACTER_ATTRIBUTE, EDIT_CHARACTER_ATTRIBUTE_METADATA } from '../constants/ActionTypes'
import { nextId } from '../store/newIds'

const EMPTY_ATTRIBUTE_STATE = {
  books: {},
}

const INITIAL_STATE = {
  characters: EMPTY_ATTRIBUTE_STATE,
}

const attributesReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case CREATE_CHARACTER_ATTRIBUTE: {
        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE
        const characterAttributes = characterAttributeState.books[action.bookId] || []
        const newAttributeId = nextId(characterAttributes)
        return {
          ...state,
          characters: {
            ...characterAttributeState,
            books: {
              ...characterAttributeState.books,
              [action.bookId]: [
                ...characterAttributes,
                { ...action.attribute, id: newAttributeId },
              ],
            },
          },
        }
      }

      case EDIT_CHARACTER_ATTRIBUTE_METADATA: {
        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE
        const characterAttributes = characterAttributeState.books[action.bookId] || []
        return {
          ...state,
          characters: {
            ...characterAttributeState,
            books: {
              [action.bookId]: characterAttributes.map((attribute) => {
                if (attribute.id === action.id) {
                  return {
                    ...attribute,
                    name: action.name,
                    type: action.attributeType,
                  }
                }

                return attribute
              }),
            },
          },
        }
      }

      case FILE_LOADED: {
        return action.data.attributes
      }

      default: {
        return state
      }
    }
  }

export default attributesReducer