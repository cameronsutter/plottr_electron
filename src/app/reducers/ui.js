import { CHANGE_CURRENT_VIEW, CHANGE_ORIENTATION, FILE_LOADED, NEW_FILE,
  SET_DARK_MODE, SET_CHARACTER_SORT, SET_PLACE_SORT, SET_CHARACTER_FILTER,
  SET_PLACE_FILTER, ADD_CHARACTER_ATTRIBUTE, ADD_PLACES_ATTRIBUTE,
  REMOVE_CHARACTER_ATTRIBUTE, REMOVE_PLACES_ATTRIBUTE, EDIT_CHARACTER_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE, INCREASE_ZOOM, DECREASE_ZOOM, FIT_ZOOM, RESET_ZOOM, CHANGE_CURRENT_TIMELINE, DELETE_BOOK } from '../constants/ActionTypes'
import { ZOOM_STATES, INITIAL_ZOOM_INDEX, INITIAL_ZOOM_STATE, FIT_ZOOM_STATE } from 'constants/zoom_states'
import { ui as defaultUI } from '../../../shared/initialState'
import { newFileUI } from '../../../shared/newFileState'

export default function ui (state = defaultUI, action) {
  let filter;
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return Object.assign({}, state, {currentView: action.view})

    case CHANGE_ORIENTATION:
      return Object.assign({}, state, {orientation: action.orientation})

    case CHANGE_CURRENT_TIMELINE:
      return Object.assign({}, state, {currentTimeline: action.id})

    case DELETE_BOOK:
      if (state.currentTimeline == action.id) return Object.assign({}, state, {currentTimeline: 1})
      return state

    case SET_DARK_MODE:
      return Object.assign({}, state, {darkMode: action.on})

    case SET_CHARACTER_SORT:
      return Object.assign({}, state, {characterSort: `${action.attr}~${action.direction}`})

    case SET_PLACE_SORT:
      return Object.assign({}, state, {placeSort: `${action.attr}~${action.direction}`})

    case SET_CHARACTER_FILTER:
      return Object.assign({}, state, {characterFilter: action.filter})

    case ADD_CHARACTER_ATTRIBUTE:
      filter = {...state.characterFilter}
      filter[action.attribute] = []
      return Object.assign({}, state, {characterFilter: filter})
    case ADD_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      filter[action.attribute] = []
      return Object.assign({}, state, {placeFilter: filter})

    case REMOVE_CHARACTER_ATTRIBUTE:
      filter = {...state.characterFilter}
      delete filter[action.attribute]
      return Object.assign({}, state, {characterFilter: filter})
    case REMOVE_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      delete filter[action.attribute]
      return Object.assign({}, state, {placeFilter: filter})

    case EDIT_CHARACTER_ATTRIBUTE:
      filter = {...state.characterFilter}
      delete filter[action.old]
      filter[action.attribute] = []
      return Object.assign({}, state, {characterFilter: filter})
    case EDIT_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      delete filter[action.old]
      filter[action.attribute] = []
      return Object.assign({}, state, {placeFilter: filter})

    case SET_PLACE_FILTER:
      return Object.assign({}, state, {placeFilter: action.filter})

    case INCREASE_ZOOM:
      var newIndex = state.zoomIndex || 0
      if (newIndex < ZOOM_STATES.length - 1) newIndex++
      return Object.assign({}, state, {zoomState: INITIAL_ZOOM_STATE, zoomIndex: newIndex})

    case DECREASE_ZOOM:
      var newIndex = state.zoomIndex || 0
      if (newIndex > 0) newIndex--
      return Object.assign({}, state, {zoomState: INITIAL_ZOOM_STATE, zoomIndex: newIndex})

    case FIT_ZOOM:
      return Object.assign({}, state, {zoomState: FIT_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})

    case RESET_ZOOM:
      return Object.assign({}, state, {zoomState: INITIAL_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})

    case FILE_LOADED:
      return action.data.ui

    case NEW_FILE:
      return newFileUI

    default:
      return state
  }
}
