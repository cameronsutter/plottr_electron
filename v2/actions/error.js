import { CLEAR_ERROR, PERMISSION_ERROR } from '../constants/ActionTypes'

export const permissionError = (storeKey, action, error) => ({
  type: PERMISSION_ERROR,
  storeKey,
  action,
  error,
})

export const clearError = () => ({
  type: CLEAR_ERROR,
})
