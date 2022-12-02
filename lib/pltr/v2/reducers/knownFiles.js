import { SET_KNOWN_FILES } from '../constants/ActionTypes'

/* e.g. state
 * [
 *   {
 *     "pathToContainingFolder": ["Users", "johndoe", "documents", "plottr-files"],
 *     "fileURL": "device:///Users/edwardsteere/Downloads/Untitled-Return-of-the-test.pltr",
 *     "lastOpened": 1636969518301,
 *     "fileName": "Untitled. Return of the Test.",
 *     "permission": "owner",
 *     "isOfflineBackup": false,
 *     "isBackupFile": false,
 *     "isTempFile": false
 *   },
 * ]
 */

const INITIAL_STATE = []

const knownFilesReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_KNOWN_FILES: {
      return action.knownFiles
    }
    default: {
      return state
    }
  }
}

export default knownFilesReducer
