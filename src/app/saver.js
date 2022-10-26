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

const MAX_SAVE_JOBS = 5

class Saver {
  getState = () => ({})
  saveCount = 0
  logger = {
    info: (jobId, ...args) => this._logger.info(`[Save job: ${jobId}]`, ...args),
    warn: (jobId, ...args) => this._logger.warn(`[Save job: ${jobId}]`, ...args),
    error: (jobId, ...args) => this._logger.error(`[Save job: ${jobId}]`, ...args),
  }
  _logger = {
    info: (...args) => console.log(args),
    warn: (...args) => console.warn(args),
    error: (...args) => console.error(args),
  }
  saveFile = (file) => Promise.resolve()
  backupFile = (file) => Promise.resolve()
  saveInterval = DEFAULT_SAVE_INTERVAL_MS
  saveTimer = null
  backupInterval = DEFAULT_BACKUP_INTERVAL_MS
  backupTimer = null
  pendingSaveBuffer = []
  saveJob = null
  pendingBackupBuffer = []

  constructor(
    getState,
    saveFile,
    backupFile,
    logger,
    saveIntervalMS = DEFAULT_SAVE_INTERVAL_MS,
    backupIntervalMS = DEFAULT_BACKUP_INTERVAL_MS
  ) {
    this.getState = getState
    this._logger = logger
    this.saveFile = saveFile
    this.backupFile = backupFile
    this.saveInterval = saveIntervalMS
    this.backupInterval = backupIntervalMS

    this.saveTimer = setInterval(this.save, this.saveInterval)
    this.backupTimer = setInterval(this.backup, this.backupInterval)
  }

  save = () => {
    const jobId = this.saveCount++
    this.logger.info(jobId, `Starting save job`)

    if (this.pendingSaveBuffer.length >= MAX_SAVE_JOBS) {
      const error = new Error('Too many concurrent save jobs; dropping request to save')
      this.logger.error(jobId, 'Too many concurrent saves', error)
      return Promise.reject(error)
    }

    this.logger.info(jobId, 'Accepted request to save with current state.')

    const currentState = this.getState()
    this.pendingSaveBuffer.push(() => this.saveFile(currentState))
    if (this.saveJob) {
      this.logger.info(jobId, 'Saver busy.  Waiting for last save job to finish first')
      return this.saveJob
        .then(() => {
          this.logger.info(jobId, 'Saver ready, comencing with save job.')
          this.saveJob = this.pendingSaveBuffer.shift()()
          return this.saveJob
        })
        .catch((error) => {
          this.logger.error(jobId, 'Error executing previous save job.  Enqueing next anyway.')
          this.saveJob = this.pendingSaveBuffer.shift()()
          return this.saveJob
        })
    }

    this.saveJob = this.pendingSaveBuffer.shift()()
    return this.saveJob
  }

  backup = () => {
    return this.saveBackup(this.getState())
  }

  cancelAllRemainingRequests = () => {}
}

export default Saver
