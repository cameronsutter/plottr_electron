import { FILE_LOADED } from '../../v1/constants/ActionTypes'
import {
  CREATE_CHARACTER_ATTRIBUTE,
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
} from '../constants/ActionTypes'

const EMPTY_ATTRIBUTE_STATE = []

const INITIAL_STATE = {
  characters: EMPTY_ATTRIBUTE_STATE,
}

const attributesReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case CREATE_CHARACTER_ATTRIBUTE: {
        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE

        return {
          ...state,
          characters: [
            ...characterAttributeState,
            { ...action.attribute, id: action.nextAttributeId, bookId: action.bookId },
          ],
        }
      }

      case EDIT_CHARACTER_ATTRIBUTE_METADATA: {
        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE

        return {
          ...state,
          characters: [
            ...characterAttributeState.map((attribute) => {
              if (attribute.id === action.id) {
                return {
                  ...attribute,
                  name: action.name,
                  type: action.attributeType,
                }
              }

              return attribute
            }),
          ],
        }
      }

      case DELETE_CHARACTER_ATTRIBUTE: {
        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE

        return {
          ...state,
          characters: [
            ...characterAttributeState.filter((attribute) => {
              return attribute.id !== action.id
            }),
          ],
        }
      }

      case REORDER_CHARACTER_ATTRIBUTE_METADATA: {
        const { toIndex, attribute } = action

        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE
        const copy = characterAttributeState.slice().filter(({ id }) => id !== attribute.id)
        copy.splice(toIndex, 0, attribute)

        return {
          ...state,
          characters: copy,
        }
      }

      case FILE_LOADED: {
        return action.data.attributes || {}
      }

      default: {
        return state
      }
    }
  }

export default attributesReducer
