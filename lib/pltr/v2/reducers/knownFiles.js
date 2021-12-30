import { SET_KNOWN_FILES } from '../constants/ActionTypes'

/* e.g. state
 * {
 *   "7": {
 *     "path": "/Users/edwardsteere/Downloads/Untitled-Return-of-the-test.pltr",
 *     "lastOpened": 1636969518301
 *   },
 * }
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
