import { CHANGE_CURRENT_VIEW, CHANGE_ORIENTATION, FILE_LOADED, NEW_FILE,
  SET_DARK_MODE, SET_CHARACTER_SORT, SET_PLACE_SORT, SET_CHARACTER_FILTER,
  SET_PLACE_FILTER, ADD_CHARACTER_ATTRIBUTE, ADD_PLACES_ATTRIBUTE,
  REMOVE_CHARACTER_ATTRIBUTE, REMOVE_PLACES_ATTRIBUTE, EDIT_CHARACTER_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE, SET_TIMELINE_FILTER, RECORD_SCROLL_POSITION,
  CHANGE_CURRENT_TIMELINE, NAVIGATE_TO_BOOK_TIMELINE, EXPAND_TIMELINE, COLLAPSE_TIMELINE } from '../constants/ActionTypes'
import { ui as defaultUI } from '../store/initialState'
import { newFileUI } from '../store/newFileState'

export default function ui (state = defaultUI, action) {
  let filter;
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return Object.assign({}, state, {currentView: action.view})

    case CHANGE_ORIENTATION:
      return Object.assign({}, state, {orientation: action.orientation})

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
      return Object.assign({}, state, {timelineIsExpanded: true})

    case COLLAPSE_TIMELINE:
      return Object.assign({}, state, {timelineIsExpanded: false})

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
      if (action.attribute.type == 'paragraph') return state
      filter[action.attribute.name] = []
      return Object.assign({}, state, {characterFilter: filter})
    case ADD_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      if (action.attribute.type == 'paragraph') return state
      filter[action.attribute.name] = []
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
      delete filter[action.oldAttribute.name]
      if (action.newAttribute.type == 'paragraph') return state
      filter[action.newAttribute.name] = []
      return Object.assign({}, state, {characterFilter: filter})
    case EDIT_PLACES_ATTRIBUTE:
      filter = {...state.placeFilter}
      delete filter[action.oldAttribute.name]
      if (action.newAttribute.type == 'paragraph') return state
      filter[action.newAttribute.name] = []
      return Object.assign({}, state, {placeFilter: filter})

    case SET_PLACE_FILTER:
      return Object.assign({}, state, {placeFilter: action.filter})

    case SET_TIMELINE_FILTER:
      return Object.assign({}, state, {timelineFilter: action.filter})

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
        }
      };

    default:
      return state
  }
}
