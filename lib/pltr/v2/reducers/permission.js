import { SET_PERMISSION } from '../constants/ActionTypes'

const INITIAL_STATE = { permission: 'owner' }

const permissionReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SET_PERMISSION:
        return {
          permission: action.permission,
        }
      default:
        return state
    }
  }

export default permissionReducer
