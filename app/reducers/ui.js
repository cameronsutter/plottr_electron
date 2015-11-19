import { CHANGE_CURRENT_VIEW, FILE_LOADED } from '../constants/ActionTypes'

const initialState = {
  currentView: 'timeline'
}

export default function ui (state = initialState, action) {
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return { currentView: action.view }

    case FILE_LOADED:
      return action.data.ui

    default:
      return state
  }
}
