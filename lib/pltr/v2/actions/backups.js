import { SET_BACKUP_FOLDERS } from '../constants/ActionTypes'

export const setBackupFolders = (folders) => ({
  type: SET_BACKUP_FOLDERS,
  folders,
})
