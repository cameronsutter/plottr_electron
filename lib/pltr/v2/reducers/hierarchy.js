import { omit } from 'lodash'

import {
  ADD_BOOK,
  ADD_BOOK_FROM_TEMPLATE,
  DELETE_BOOK,
  EDIT_HIERARCHY_LEVEL,
  LOAD_HIERARCHY,
  SET_HIERARCHY_LEVELS,
} from '../constants/ActionTypes'
import { newFileHierarchies } from '../store/newFileState'
import { FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { hierarchyLevel } from '../store/initialState'

const INITIAL_STATE = newFileHierarchies

const hierarchy =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SET_HIERARCHY_LEVELS: {
        if (action.hierarchyLevels.length === 0 || action.hierarchyLevels.length > 3) return state

        const oldHierarchies = state[action.timeline]

        const newHierarchies = action.hierarchyLevels.reduce(
          (acc, next, index) => ({
            ...acc,
            [index]: {
              ...next,
              level: index,
            },
          }),
          {}
        )

        const finalHierarchies =
          Object.keys(oldHierarchies).length === 1 &&
          Object.keys(newHierarchies).length === 2 &&
          newHierarchies['1'].name === newHierarchies['0'].name
            ? {
                0: newHierarchies['0'],
                1: {
                  ...newHierarchies['1'],
                  name: 'Scene',
                },
              }
            : newHierarchies

        return {
          ...state,
          [action.timeline]: finalHierarchies,
        }
      }

      case EDIT_HIERARCHY_LEVEL:
        return {
          ...state,
          [action.timeline]: {
            ...state[action.timeline],
            [action.hierarchyLevel.level]: {
              ...state[action.timeline][action.hierarchyLevel.level],
              ...action.hierarchyLevel,
            },
          },
        }

      case DELETE_BOOK: {
        return omit(state, action.id.toString())
      }

      case ADD_BOOK_FROM_TEMPLATE:
      case ADD_BOOK: {
        return {
          ...state,
          [action.newBookId]: action.templateData?.hierarchyLevels['1'] || { 0: hierarchyLevel },
        }
      }

      case RESET:
      case FILE_LOADED:
        return action.data.hierarchyLevels || INITIAL_STATE

      case NEW_FILE:
        return INITIAL_STATE

      case LOAD_HIERARCHY:
        return action.hierarchy

      default:
        return state
    }
  }

export default hierarchy
