import { CHANGE_CURRENT_VIEW, FILE_LOADED } from '../constants/ActionTypes'
import { ui as defaultUI } from 'store/initialState'

export default function ui (state = defaultUI, action) {
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return { currentView: action.view }

    case FILE_LOADED:
      return action.data.ui

    default:
      return state
  }
}
