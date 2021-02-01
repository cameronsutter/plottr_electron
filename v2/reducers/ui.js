import {
  ADD_CHARACTER_ATTRIBUTE,
  ADD_PLACES_ATTRIBUTE,
  CHANGE_CURRENT_TIMELINE,
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  CLOSE_ATTRIBUTES_DIALOG,
  COLLAPSE_TIMELINE,
  DECREASE_ZOOM,
  EDIT_CHARACTER_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE,
  EXPAND_TIMELINE,
  FILE_LOADED,
  FIT_ZOOM,
  INCREASE_ZOOM,
  NAVIGATE_TO_BOOK_TIMELINE,
  NEW_FILE,
  OPEN_ATTRIBUTES_DIALOG,
  RECORD_SCROLL_POSITION,
  REMOVE_CHARACTER_ATTRIBUTE,
  REMOVE_PLACES_ATTRIBUTE,
  RESET_ZOOM,
  SET_CHARACTER_FILTER,
  SET_CHARACTER_SORT,
  SET_DARK_MODE,
  SET_PLACE_FILTER,
  SET_PLACE_SORT,
  SET_TIMELINE_FILTER,
  SET_TIMELINE_SIZE,
} from '../constants/ActionTypes'
import {
  ZOOM_STATES,
  INITIAL_ZOOM_INDEX,
  INITIAL_ZOOM_STATE,
  FIT_ZOOM_STATE,
} from '../constants/zoom_states'
import { ui as defaultUI } from '../store/initialState'
import { newFileUI } from '../store/newFileState'

export default function ui(state = defaultUI, action) {
  let filter
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return Object.assign({}, state, { currentView: action.view })

    case CHANGE_ORIENTATION:
      return Object.assign({}, state, { orientation: action.orientation })

    case CHANGE_CURRENT_TIMELINE:
      return Object.assign({}, state, {
        currentTimeline: action.id,
        timelineScrollPosition: { x: 0, y: 0 },
      })

    case NAVIGATE_TO_BOOK_TIMELINE:
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

    case INCREASE_ZOOM:
      var newIndex = state.zoomIndex || 0
      if (newIndex < ZOOM_STATES.length - 1) newIndex++
      return Object.assign({}, state, { zoomState: INITIAL_ZOOM_STATE, zoomIndex: newIndex })

    case DECREASE_ZOOM:
      var newIndex = state.zoomIndex || 0
      if (newIndex > 0) newIndex--
      return Object.assign({}, state, { zoomState: INITIAL_ZOOM_STATE, zoomIndex: newIndex })

    case FIT_ZOOM:
      return Object.assign({}, state, { zoomState: FIT_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX })

    case RESET_ZOOM:
      return Object.assign({}, state, {
        zoomState: INITIAL_ZOOM_STATE,
        zoomIndex: INITIAL_ZOOM_INDEX,
      })

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

    case SET_TIMELINE_SIZE:
      return timeline(state, action)

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
