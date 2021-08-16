import { ActionTypes } from 'pltr/v2'

export const shouldIgnoreAction = (action) => {
  return (
    action.type === ActionTypes.RESET_ACTION_RECORDER ||
    action.type === ActionTypes.RECORD_LAST_ACTION
  )
}
