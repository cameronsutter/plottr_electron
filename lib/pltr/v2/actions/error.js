import {
  CLEAR_ERROR,
  PERMISSION_ERROR,
  GENERAL_ERROR,
  IMPORT_ERROR,
  SAVE_TEMP_FILE_ERROR,
} from '../constants/ActionTypes'

export const permissionError = (storeKey, action, error) => ({
  type: PERMISSION_ERROR,
  storeKey,
  action,
  error,
})

export const generalError = (error) => ({
  type: GENERAL_ERROR,
  error,
})

export const clearError = () => ({
  type: CLEAR_ERROR,
})

export const importError = (error) => ({
  type: IMPORT_ERROR,
  error,
})

export const saveTempFileError = (errorMessage) => ({
  type: SAVE_TEMP_FILE_ERROR,
  error: errorMessage,
})
