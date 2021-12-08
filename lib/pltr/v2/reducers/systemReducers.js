import {
  ACTION_ACTIONS,
  CLIENT_ACTIONS,
  ERROR_ACTIONS,
  PERMISSION_ACTIONS,
  PROJECT_ACTIONS,
} from '../constants/ActionTypes'

export const SYSTEM_REDUCER_KEYS = ['error', 'permission', 'project', 'actions', 'client']
export const SYSTEM_REDUCER_ACTION_TYPES = ERROR_ACTIONS.concat(PERMISSION_ACTIONS)
  .concat(PROJECT_ACTIONS)
  .concat(ACTION_ACTIONS)
  .concat(CLIENT_ACTIONS)
