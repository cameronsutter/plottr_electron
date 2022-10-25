import { FILE_LOADED } from '../../v1/constants/ActionTypes'
import {
  ATTACH_BOOK_TO_CHARACTER,
  ATTACH_TAG_TO_CHARACTER,
  CREATE_CHARACTER_ATTRIBUTE,
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_CATEGORY,
  REMOVE_TAG_FROM_CHARACTER,
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
            { ...action.attribute, id: action.nextAttributeId },
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
        const { toIndex, attributeId } = action

        const characterAttributeState = state.characters || EMPTY_ATTRIBUTE_STATE
        const existingAttribute = characterAttributeState.find((existingAttribute) => {
          return existingAttribute.id === attributeId
        })
        if (!existingAttribute) {
          return state
        }
        const copy = characterAttributeState.slice().filter(({ id }) => id !== attributeId)
        copy.splice(toIndex, 0, existingAttribute)

        return {
          ...state,
          characters: copy,
        }
      }

      case REMOVE_TAG_FROM_CHARACTER:
      case ATTACH_TAG_TO_CHARACTER: {
        const attributeExists = state.characters.some((attribute) => {
          return attribute.id === action.attributeId
        })
        if (attributeExists) {
          return state
        }

        return {
          ...state,
          characters: [
            ...state.characters,
            {
              name: 'tags',
              type: 'base-attribute',
              id: action.attributeId,
            },
          ],
        }
      }

      case EDIT_CHARACTER_SHORT_DESCRIPTION: {
        const attributeExists = state.characters.some((attribute) => {
          return attribute.id === action.attributeId
        })
        if (attributeExists) {
          return state
        }

        return {
          ...state,
          characters: [
            ...state.characters,
            {
              name: 'shortDescription',
              type: 'base-attribute',
              id: action.attributeId,
            },
          ],
        }
      }

      case EDIT_CHARACTER_DESCRIPTION: {
        const attributeExists = state.characters.some((attribute) => {
          return attribute.id === action.attributeId
        })
        if (attributeExists) {
          return state
        }

        return {
          ...state,
          characters: [
            ...state.characters,
            {
              name: 'description',
              type: 'base-attribute',
              id: action.attributeId,
            },
          ],
        }
      }

      case EDIT_CHARACTER_CATEGORY: {
        const attributeExists = state.characters.some((attribute) => {
          return attribute.id === action.attributeId
        })
        if (attributeExists) {
          return state
        }

        return {
          ...state,
          characters: [
            ...state.characters,
            {
              name: 'category',
              type: 'base-attribute',
              id: action.attributeId,
            },
          ],
        }
      }

      case FILE_LOADED: {
        return action.data.attributes || INITIAL_STATE
      }

      default: {
        return state
      }
    }
  }

export default attributesReducer
