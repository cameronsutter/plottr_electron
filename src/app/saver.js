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

class PressureControlledTaskQueue {
  name = 'UnamedPressureControlledTaskQueue'
  jobId = 0
  running = false
  logger = {
    info: (jobId, ...args) => this._logger.info(`[${this.name} job: ${jobId}]`, ...args),
    warn: (jobId, ...args) => this._logger.warn(`[${this.name} job: ${jobId}]`, ...args),
    error: (jobId, ...args) => this._logger.error(`[${this.name} job: ${jobId}]`, ...args),
  }
  _logger = {
    info: (...args) => console.log(args),
    warn: (...args) => console.warn(args),
    error: (...args) => console.error(args),
  }
  createNextJob = () => () => Promise.resolve()
  currentJob = null
  maxJobs = 5
  pendingJobBuffer = []
  jobTimer = null
  jobInterval = 10000

  constructor(name, createNextJob, logger, maxJobs, jobInterval = 10000) {
    this.name = name
    this.createNextJob = createNextJob
    this._logger = logger
    this.maxJobs = maxJobs
    this.jobInterval = jobInterval
  }

  executePendingJob = () => {
    if (this.pendingJobBuffer.length === 0) {
      return
    }

    const nextJob = this.pendingJobBuffer.shift()
    this.currentJob = nextJob().then(() => {
      this.currentJob = null
    })
  }

  enqueueJob = () => {
    const jobId = this.jobId++
    const name = this.name
    const jobThunk = this.createNextJob()
    this.logger.info(jobId, `Starting ${name} job`)

    if (this.pendingJobBuffer.length >= this.maxJobs) {
      const error = new Error(`Too many concurrent ${name} jobs; dropping request to ${name}`)
      this.logger.error(jobId, `Too many concurrent ${name}s`, error)
      return Promise.reject(error)
    }

    this.logger.info(jobId, `Accepted request to ${name} with current state.`)

    this.pendingJobBuffer.push(jobThunk)
    if (this.currentJob) {
      this.logger.info(jobId, `${name} busy.  Waiting for last ${name} job to finish first`)
      return this.currentJob
        .then(() => {
          this.logger.info(jobId, `${name} ready, comencing with ${name} job.`)
          return this.currentJob
        })
        .catch((error) => {
          this.logger.error(jobId, `Error executing previous ${name} job.  Enqueing next anyway.`)
          this.executePendingJob()
          return this.currentJob
        })
    }

    this.executePendingJob()
    return this.currentJob
  }

  stop = () => {
    if (!this.running) {
      this.logger.warn(`${this.name} is not running; cannot stop a stopped ${this.name}'`)
      return
    }

    this.logger.warn(`Stopping ${this.name}`)
    this.running = false
    clearInterval(this.jobTimer)
    this.jobTimer = null
  }

  start = () => {
    if (this.running) {
      this.logger.warn(`${this.name} is running; cannot start a running ${this.name}`)
      return
    }

    this.logger.info(`Starting ${this.name}`)
    this.running = true
    this.jobTimer = setInterval(this.enqueueJob, this.jobInterval)
  }

  cancelAllRemainingRequests = () => {
    this.logger.warn(
      `Dropping all pending ${this.name} requests.  ${this.pendingJobBuffer.length} remain unprocessed`
    )
    this.pendingJobBuffer = []
    this.stop()
  }
}

class Saver {
  getState = () => ({})
  saveFile = (file) => Promise.resolve()
  backupFile = (file) => Promise.resolve()
  logger = {
    info: (...args) => console.log(args),
    warn: (...args) => console.warn(args),
    error: (...args) => console.error(args),
  }
  saveRunner = null

  constructor(
    getState,
    saveFile,
    backupFile,
    logger,
    saveIntervalMS = DEFAULT_SAVE_INTERVAL_MS,
    backupIntervalMS = DEFAULT_BACKUP_INTERVAL_MS
  ) {
    this.getState = getState
    this.logger = logger
    this.saveFile = saveFile
    this.backupFile = backupFile

    this.saveRunner = new PressureControlledTaskQueue(
      'Save',
      () => {
        const currentState = this.getState()
        return () => {
          return this.saveFile(currentState)
        }
      },
      logger,
      MAX_SAVE_JOBS,
      saveIntervalMS
    )
    this.saveRunner.start()
  }

  save = () => {
    return this.saveRunner.enqueueJob()
  }

  backup = () => {
    return this.saveBackup(this.getState())
  }

  cancelAllRemainingRequests = () => {
    this.saveRunner.cancelAllRemainingRequests()
  }
}

export default Saver
