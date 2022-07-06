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
  LOAD_UI,
  LOAD_BEATS,
  NAVIGATE_TO_BOOK_TIMELINE,
  NEW_FILE,
  OPEN_ATTRIBUTES_DIALOG,
  RECORD_SCROLL_POSITION,
  REMOVE_CHARACTER_ATTRIBUTE,
  REMOVE_PLACES_ATTRIBUTE,
  SET_CHARACTER_FILTER,
  SET_CHARACTER_SORT,
  SET_NOTE_FILTER,
  SET_NOTE_SORT,
  SET_OUTLINE_FILTER,
  SET_PLACE_FILTER,
  SET_PLACE_SORT,
  SET_TIMELINE_FILTER,
  SET_TIMELINE_SIZE,
  SET_NOTES_SEARCH_TERM,
  SET_TAGS_SEARCH_TERM,
  SET_PLACES_SEARCH_TERM,
  SET_CHARACTERS_SEARCH_TERM,
  SET_OUTLINE_SEARCH_TERM,
  SET_TIMELINE_SEARCH_TERM,
  ADD_NOTE,
  ADD_CHARACTER,
  ADD_PLACE,
  ADD_TAG,
  ADD_CARD,
  ADD_CREATED_TAG,
  SET_ACTIVE_TIMELINE_TAB,
  SET_TIMELINE_VIEW,
  DELETE_BEAT,
} from '../constants/ActionTypes'
import { ui as defaultUI } from '../store/initialState'
import { newFileUI } from '../store/newFileState'

const ui =
  (dataRepairers) =>
  (state = defaultUI, action) => {
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

      case LOAD_BEATS: {
        if (!action.beats[state.currentTimeline]) {
          return {
            ...state,
            currentTimeline: Object.keys(action.beats)[0],
          }
        }
        return state
      }

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

      case SET_CHARACTER_SORT:
        return Object.assign({}, state, { characterSort: `${action.attr}~${action.direction}` })

      case SET_PLACE_SORT:
        return Object.assign({}, state, { placeSort: `${action.attr}~${action.direction}` })

      case SET_NOTE_SORT:
        return Object.assign({}, state, { noteSort: `${action.attr}~${action.direction}` })

      case SET_NOTE_FILTER:
        return Object.assign({}, state, { noteFilter: action.filter })

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

      case SET_OUTLINE_FILTER: {
        if (!action.filter || !Object.values(action.filter)) {
          filter = null
        } else if (typeof action.filter === 'object') {
          filter = action.filter
        } else if (
          Array.isArray(state.outlineFilter) &&
          state.outlineFilter.includes(action.filter)
        ) {
          filter = state.outlineFilter.filter((item) => item !== action.filter)
          if (filter.length === 0) {
            filter = null
          }
        } else if (!Array.isArray(state.outlineFilter)) {
          filter = [action.filter]
        } else if (Array.isArray(state.outlineFilter)) {
          filter = [...state.outlineFilter, action.filter]
        }

        return Object.assign({}, state, { outlineFilter: filter })
      }

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
        return {
          ...state,
          timeline: timeline(state.timeline, action),
        }

      case SET_NOTES_SEARCH_TERM: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            notes: action.searchTerm,
          },
        }
      }

      case ADD_NOTE: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            notes: null,
          },
        }
      }

      case SET_CHARACTERS_SEARCH_TERM: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            characters: action.searchTerm,
          },
        }
      }

      case ADD_CHARACTER: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            characters: null,
          },
        }
      }

      case SET_PLACES_SEARCH_TERM: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            places: action.searchTerm,
          },
        }
      }

      case ADD_PLACE: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            places: null,
          },
        }
      }

      case SET_TAGS_SEARCH_TERM: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            tags: action.searchTerm,
          },
        }
      }

      case ADD_CREATED_TAG:
      case ADD_TAG: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            tags: null,
          },
        }
      }

      case SET_OUTLINE_SEARCH_TERM: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            outline: action.searchTerm,
          },
        }
      }

      case SET_TIMELINE_SEARCH_TERM: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            timeline: action.searchTerm,
          },
        }
      }

      case ADD_CARD: {
        return {
          ...state,
          searchTerms: {
            ...state.searchTerms,
            outline: null,
            timeline: null,
          },
        }
      }

      case SET_ACTIVE_TIMELINE_TAB: {
        return {
          ...state,
          timeline: {
            ...state.timeline,
            actTab: action.activeTab,
          },
        }
      }

      case SET_TIMELINE_VIEW: {
        return {
          ...state,
          timeline: {
            ...state.timeline,
            view: action.timelineView,
          },
        }
      }

      case DELETE_BEAT: {
        return {
          ...state,
          timeline: {
            ...state.timeline,
            actTab: Math.max(0, state.timeline.actTab - 1),
          },
        }
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

export default ui
