import {
  ADD_CHARACTER_ATTRIBUTE,
  ADD_PLACES_ATTRIBUTE,
  CHANGE_CURRENT_TIMELINE,
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  CLOSE_ATTRIBUTES_DIALOG,
  COLLAPSE_TIMELINE,
  EDIT_CHARACTER_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE,
  EXPAND_TIMELINE,
  FILE_LOADED,
  NAVIGATE_TO_BOOK_TIMELINE,
  NEW_FILE,
  OPEN_ATTRIBUTES_DIALOG,
  RECORD_SCROLL_POSITION,
  REMOVE_CHARACTER_ATTRIBUTE,
  REMOVE_PLACES_ATTRIBUTE,
  SET_CHARACTER_FILTER,
  SET_CHARACTER_SORT,
  SET_DARK_MODE,
  SET_OUTLINE_FILTER,
  SET_PLACE_FILTER,
  SET_PLACE_SORT,
  SET_TIMELINE_FILTER,
  SET_TIMELINE_SIZE,
} from '../constants/ActionTypes'
import { ui as defaultUI } from '../store/initialState'
import { newFileUI } from '../store/newFileState'
import { resetIndices } from '../helpers/beats'

export default function ui(state = defaultUI, action) {
  let filter
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      resetIndices()
      return Object.assign({}, state, { currentView: action.view })

    case CHANGE_ORIENTATION:
      resetIndices()
      return Object.assign({}, state, { orientation: action.orientation })

    case CHANGE_CURRENT_TIMELINE:
      resetIndices()
      return Object.assign({}, state, {
        currentTimeline: action.id,
        timelineScrollPosition: { x: 0, y: 0 },
      })

    case NAVIGATE_TO_BOOK_TIMELINE:
      resetIndices()
      return Object.assign({}, state, {
        currentTimeline: action.bookId,
        currentView: 'timeline',
        timelineScrollPosition: { x: 0, y: 0 },
      })

    case EXPAND_TIMELINE:
      return Object.assign({}, state, { timelineIsExpanded: true })

    case COLLAPSE_TIMELINE:
      return Object.assign({}, state, { timelineIsExpanded: false })

    case SET_DARK_MODE:
      return Object.assign({}, state, { darkMode: action.on })

    case SET_CHARACTER_SORT:
      return Object.assign({}, state, { characterSort: `${action.attr}~${action.direction}` })

    case SET_PLACE_SORT:
      return Object.assign({}, state, { placeSort: `${action.attr}~${action.direction}` })

    case SET_CHARACTER_FILTER:
      return Object.assign({}, state, { characterFilter: action.filter })

    case ADD_CHARACTER_ATTRIBUTE:
      filter = { ...state.characterFilter }
      if (action.attribute.type == 'paragraph') return state
      filter[action.attribute.name] = []
      return Object.assign({}, state, { characterFilter: filter })
    case ADD_PLACES_ATTRIBUTE:
      filter = { ...state.placeFilter }
      if (action.attribute.type == 'paragraph') return state
      filter[action.attribute.name] = []
      return Object.assign({}, state, { placeFilter: filter })

    case REMOVE_CHARACTER_ATTRIBUTE:
      filter = { ...state.characterFilter }
      delete filter[action.attribute]
      return Object.assign({}, state, { characterFilter: filter })
    case REMOVE_PLACES_ATTRIBUTE:
      filter = { ...state.placeFilter }
      delete filter[action.attribute]
      return Object.assign({}, state, { placeFilter: filter })

    case EDIT_CHARACTER_ATTRIBUTE:
      filter = { ...state.characterFilter }
      delete filter[action.oldAttribute.name]
      if (action.newAttribute.type == 'paragraph') return state
      filter[action.newAttribute.name] = []
      return Object.assign({}, state, { characterFilter: filter })
    case EDIT_PLACES_ATTRIBUTE:
      filter = { ...state.placeFilter }
      delete filter[action.oldAttribute.name]
      if (action.newAttribute.type == 'paragraph') return state
      filter[action.newAttribute.name] = []
      return Object.assign({}, state, { placeFilter: filter })

    case SET_PLACE_FILTER:
      return Object.assign({}, state, { placeFilter: action.filter })

    case SET_TIMELINE_FILTER:
      return Object.assign({}, state, { timelineFilter: action.filter })

    case SET_OUTLINE_FILTER:
      resetIndices()
      if (!action.filter) filter = null
      else if (Array.isArray(state.outlineFilter) && state.outlineFilter.includes(action.filter))
        filter = state.outlineFilter.filter((item) => item !== action.filter)
      else if (!Array.isArray(state.outlineFilter)) filter = [action.filter]
      else if (Array.isArray(state.outlineFilter)) filter = [...state.outlineFilter, action.filter]

      return Object.assign({}, state, { outlineFilter: filter })

    case FILE_LOADED:
      return action.data.ui

    case NEW_FILE:
      return newFileUI

    case RECORD_SCROLL_POSITION:
      return {
        ...state,
        timelineScrollPosition: {
          x: action.x,
          y: action.y,
        },
      }

    case OPEN_ATTRIBUTES_DIALOG:
      return {
        ...state,
        attributesDialogIsOpen: true,
      }

    case CLOSE_ATTRIBUTES_DIALOG:
      return {
        ...state,
        attributesDialogIsOpen: false,
      }

    case SET_TIMELINE_SIZE:
      resetIndices()
      return {
        ...state,
        timeline: timeline(state.timeline, action),
      }

    default:
      return state
  }
}

function timeline(state = defaultUI.timeline, action) {
  switch (action.type) {
    case SET_TIMELINE_SIZE:
      return Object.assign({}, state, { size: action.newSize })
    default:
      return state
  }
}
