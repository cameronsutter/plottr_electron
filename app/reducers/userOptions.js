import { FILE_LOADED } from '../constants/ActionTypes'

const initialState = {}

export default function userOptions (state = initialState, action) {
  switch (action.type) {
    case FILE_LOADED:
      return action.data.userOptions

    default:
      return state
  }
}
