import {
  FILE_LOADED,
  NEW_FILE,
  RESET,
  ADD_CHARACTER_CATEGORY,
  DELETE_CHARACTER_CATEGORY,
  UPDATE_CHARACTER_CATEGORY,
  REORDER_CHARACTER_CATEGORY,
  ADD_NOTE_CATEGORY,
  DELETE_NOTE_CATEGORY,
  UPDATE_NOTE_CATEGORY,
  REORDER_NOTE_CATEGORY,
  ADD_TAG_CATEGORY,
  DELETE_TAG_CATEGORY,
  UPDATE_TAG_CATEGORY,
  REORDER_TAG_CATEGORY,
} from '../constants/ActionTypes'
import { newFileCategories } from '../store/newFileState'
import { categories as defaultCategories } from '../store/initialState'
import { nextId } from '../store/newIds'
import { positionReset } from '../helpers/lists'

const categories =
  (dataRepairers) =>
  (state = defaultCategories, action) => {
    switch (action.type) {
      case RESET:
      case FILE_LOADED:
        return action.data.categories

      case NEW_FILE:
        return newFileCategories

      case ADD_NOTE_CATEGORY:
        return addCategory('notes', state, action)

      case DELETE_NOTE_CATEGORY:
        return deleteCategory('notes', state, action)

      case UPDATE_NOTE_CATEGORY:
        return updateCategory('notes', state, action)

      case REORDER_NOTE_CATEGORY:
        return reorderCategory('notes', state, action)

      case ADD_CHARACTER_CATEGORY:
        return addCategory('characters', state, action)

      case DELETE_CHARACTER_CATEGORY:
        return deleteCategory('characters', state, action)

      case UPDATE_CHARACTER_CATEGORY:
        return updateCategory('characters', state, action)

      case REORDER_CHARACTER_CATEGORY:
        return reorderCategory('characters', state, action)

      case ADD_TAG_CATEGORY:
        return addCategory('tags', state, action)

      case DELETE_TAG_CATEGORY:
        return deleteCategory('tags', state, action)

      case UPDATE_TAG_CATEGORY:
        return updateCategory('tags', state, action)

      case REORDER_TAG_CATEGORY:
        return reorderCategory('tags', state, action)

      default:
        return state
    }
  }

function addCategory(key, state, action) {
  const id = nextId(state[key])
  return {
    ...state,
    [key]: [
      ...state[key],
      {
        id,
        name: action.name,
        position: state[key].length,
      },
    ],
  }
}

function deleteCategory(key, state, action) {
  const index = state[key].findIndex((item) => item.id === action.category.id)
  if (index == -1) return state

  const newArray = [...state[key].slice(0, index), ...state[key].slice(index + 1)]
  newArray.forEach((category, i) => (category.position = i))

  return {
    ...state,
    [key]: newArray,
  }
}

function updateCategory(key, state, action) {
  const index = state[key].findIndex((item) => item.id === action.category.id)
  if (index === -1) return state

  const newArray = [...state[key]]
  newArray[index] = {
    ...state[key][index],
    ...action.category,
  }

  return {
    ...state,
    [key]: newArray,
  }
}

function reorderCategory(key, state, { toIndex, category }) {
  const copy = state[key].slice().filter(({ id }) => id != category.id)

  copy.splice(toIndex, 0, category)
  const newList = positionReset(copy) // have to change the value of the position attribute
  return {
    ...state,
    [key]: newList,
  }
}

export default categories
