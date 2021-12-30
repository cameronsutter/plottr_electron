import { SET_BACKUP_FOLDERS } from '../constants/ActionTypes'

/* Example state:
 * {
 *   folders: [{
 *     backups: ['a-file.pltr'],
 *     path: '/file/path',
 *     date: Date(),
 *   }]
 * }
 */

const INITIAL_STATE = {
  folders: [],
}

const backupsReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_BACKUP_FOLDERS: {
      return {
        ...state,
        folders: action.folders,
      }
    }
    default: {
      return state
    }
  }
}

export default backupsReducer
