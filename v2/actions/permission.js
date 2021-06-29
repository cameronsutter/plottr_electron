import { SET_PERMISSION } from '../constants/ActionTypes'

export const setPermission = (newPermission) => ({
  type: SET_PERMISSION,
  permission: newPermission,
})
