import { FILE_LOADED } from '../constants/ActionTypes'
import { userOptions as defaultUserOptions } from 'store/initialState'

export default function userOptions (state = defaultUserOptions, action) {
  switch (action.type) {
    case FILE_LOADED:
      return action.data.userOptions

    default:
      return state
  }
}
