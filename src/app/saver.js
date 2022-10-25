/**
 * What does this thing need to do?
 *
 *  - Save on an interval.
 *  - Backup on an interval.
 *  - Prevent exiting the app with unsaved changes.
 *  - Backup cloud files to local.
 *  - Keep offline versions of cloud files for offline mode(?)
 */

const DEFAULT_SAVE_INTERVAL_MS = 10000
const DEFAULT_BACKUP_INTERVAL_MS = 60000

class Saver {
  getState = () => ({})
  saveFile = (file) => Promise.resolve()
  backupFile = (file) => Promise.resolve()
  saveInterval = DEFAULT_SAVE_INTERVAL_MS
  saveTimer = null
  backupInterval = DEFAULT_BACKUP_INTERVAL_MS
  backupTimer = null

  constructor(
    getState,
    saveFile,
    backupFile,
    saveIntervalMS = DEFAULT_SAVE_INTERVAL_MS,
    backupIntervalMS = DEFAULT_BACKUP_INTERVAL_MS
  ) {
    this.getState = getState
    this.saveInterval = saveIntervalMS
    this.backupInterval = backupIntervalMS
  }
}

export default Saver
