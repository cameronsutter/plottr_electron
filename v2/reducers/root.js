import mainReducer from './main'
import { DELETE_BOOK } from '../constants/ActionTypes'

export default function root (state, action) {
  switch (action.type) {
    case DELETE_BOOK:
      if (state.ui.currentTimeline == action.id) {
        const nextBookId = state.books.allIds.find(id => id != action.id)
        let newState = {...state}
        newState.ui.currentTimeline = nextBookId
        return mainReducer(newState, action)
      } else {
        return mainReducer(state, action)
      }

    default:
      return mainReducer(state, action)
  }
}