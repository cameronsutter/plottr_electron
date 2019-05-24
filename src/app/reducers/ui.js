import { CHANGE_CURRENT_VIEW, CHANGE_ORIENTATION, FILE_LOADED, NEW_FILE,
  SET_DARK_MODE, SET_CHARACTER_SORT, SET_PLACE_SORT, SET_CHARACTER_FILTER,
  SET_PLACE_FILTER, ADD_CHARACTER_ATTRIBUTE, ADD_PLACES_ATTRIBUTE,
  REMOVE_CHARACTER_ATTRIBUTE, REMOVE_PLACES_ATTRIBUTE, EDIT_CHARACTER_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE } from '../constants/ActionTypes'
import { ui as defaultUI } from 'store/initialState'
import { newFileUI } from 'store/newFileState'

export default function ui (state = defaultUI, action) {
  let filter;
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return Object.assign({}, state, {currentView: action.view})

    case CHANGE_ORIENTATION:
      return Object.assign({}, state, {orientation: action.orientation})

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
      delete filter[action.attribute.split(':#:')]
      return Object.assign({}, state, {characterFilter: filter})
    case REMOVE_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      delete filter[action.attribute.split(':#:')]
      return Object.assign({}, state, {placeFilter: filter})

    case EDIT_CHARACTER_ATTRIBUTE:
      filter = {...state.characterFilter}
      delete filter[action.old]
      filter[action.attribute.split(':#:')] = []
      return Object.assign({}, state, {characterFilter: filter})
    case EDIT_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      delete filter[action.old]
      filter[action.attribute.split(':#:')] = []
      return Object.assign({}, state, {placeFilter: filter})

    case SET_PLACE_FILTER:
      return Object.assign({}, state, {placeFilter: action.filter})

    case FILE_LOADED:
      return action.data.ui

    case NEW_FILE:
      return newFileUI

    default:
      return state
  }
}
