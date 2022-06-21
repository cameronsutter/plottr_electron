import { ActionTypes, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'

export const shouldIgnoreAction = (action) => {
  return (
    action.type === ActionTypes.RESET_ACTION_RECORDER ||
    action.type === ActionTypes.RECORD_LAST_ACTION ||
    action.type === ActionTypes.SET_BACKUP_FOLDERS ||
    SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) !== -1
  )
}
