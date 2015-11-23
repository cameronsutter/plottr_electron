import { CHANGE_CURRENT_VIEW, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { ui as defaultUI } from 'store/initialState'

export default function ui (state = defaultUI, action) {
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return { currentView: action.view }

    case FILE_LOADED:
      return action.data.ui

    case NEW_FILE:
      return defaultUI

    default:
      return state
  }
}
