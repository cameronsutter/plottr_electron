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

const MAX_SAVE_JOBS = 10

class Saver {
  getState = () => ({})
  running = true
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

    this.saveTimer = setInterval(() => this.save(this.jobId++, 'Save'), this.saveInterval)
    this.backupTimer = setInterval(() => this.backup(this.jobId++, 'Backup'), this.backupInterval)
  }

  executePendingSaveJob = () => {
    if (this.pendingSaveBuffer.length === 0) {
      return
    }

    const nextJob = this.pendingSaveBuffer.shift()
    this.saveJob = nextJob().then(() => {
      this.saveJob = null
    })
  }

  save = (jobId, name) => {
    this.logger.info(jobId, `Starting ${name} job`)

    if (this.pendingSaveBuffer.length >= MAX_SAVE_JOBS) {
      const error = new Error(`Too many concurrent ${name} jobs; dropping request to ${name}`)
      this.logger.error(jobId, `Too many concurrent ${name}s`, error)
      return Promise.reject(error)
    }

    this.logger.info(jobId, `Accepted request to ${name} with current state.`)

    const currentState = this.getState()
    this.pendingSaveBuffer.push(() => this.saveFile(currentState))
    if (this.saveJob) {
      this.logger.info(jobId, `${name} busy.  Waiting for last ${name} job to finish first`)
      return this.saveJob
        .then(() => {
          this.logger.info(jobId, `${name} ready, comencing with ${name} job.`)
          return this.saveJob
        })
        .catch((error) => {
          this.logger.error(jobId, `Error executing previous ${name} job.  Enqueing next anyway.`)
          this.executePendingSaveJob()
          return this.saveJob
        })
    }

    this.executePendingSaveJob()
    return this.saveJob
  }

  backup = () => {
    return this.saveBackup(this.getState())
  }

  cancelAllRemainingRequests = () => {
    this.logger.warn(
      `Dropping all pending save requests.  ${this.pendingSaveBuffer.length} remain unprocessed`
    )
    this.pendingSaveBuffer = []
    this.stop()
  }

  stop = () => {
    if (!this.running) {
      this.logger.warn('Saver is not running; cannot stop a stopped saver')
      return
    }

    this.logger.warn('Stopping saver')
    this.running = false
    clearInterval(this.saveTimer)
    this.saveTimer = null
    clearInterval(this.backupInterval)
    this.backupTimer = null
  }

  start = () => {
    if (this.running) {
      this.logger.warn('Saver is running; cannot start a running saver')
      return
    }

    this.logger.info('Starting saver')
    this.running = true
    this.saveTimer = setInterval(() => this.save(this.jobId++, 'Save'), this.saveInterval)
    this.backupTimer = setInterval(() => this.backup(this.jobId++, 'Backup'), this.backupInterval)
  }
}

export default Saver
