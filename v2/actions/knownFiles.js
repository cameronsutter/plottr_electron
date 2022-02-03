import { SET_KNOWN_FILES } from '../constants/ActionTypes'

export const setKnownFiles = (knownFiles) => ({
  type: SET_KNOWN_FILES,
  knownFiles,
})
