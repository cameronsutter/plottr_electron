import { isEqual } from 'lodash'

import { t } from 'plottr_locales'
import { removeSystemKeys } from 'pltr/v2'

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
  maxJobs = 5
  pendingJobBuffer = []
  jobTimer = null
  jobInterval = 10000
  onJobSuccess = () => {}
  onJobFailure = (_error) => {}

  constructor(
    name,
    createNextJob,
    logger,
    maxJobs,
    jobInterval = 10000,
    onJobSuccess = () => {},
    onJobFailure = (_error) => {}
  ) {
    this.name = name
    this.createNextJob = createNextJob
    this._logger = logger
    this.maxJobs = maxJobs
    this.jobInterval = jobInterval
    this.onJobSuccess = onJobSuccess
    this.onJobFailure = onJobFailure
  }

  executePendingJob = () => {
    if (this.pendingJobBuffer.length === 0 || !this.running) {
      return
    }

    const nextJob = this.pendingJobBuffer[0]
    this.logger.info('Dequeueing a job...')
    nextJob()
      .then(() => {
        this.onJobSuccess()
      })
      .catch((error) => {
        this.onJobFailure(error)
      })
      .finally(() => {
        this.pendingJobBuffer = this.pendingJobBuffer.slice(1)
        this.executePendingJob()
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
      return
    }

    this.logger.info(jobId, `Accepted request to ${name} with current state.`)

    if (this.pendingJobBuffer.length > 0) {
      this.logger.info(jobId, `${name} busy.  Waiting for last ${name} job to finish first`)
      this.pendingJobBuffer.push(jobThunk)
      return
    }

    this.pendingJobBuffer.push(jobThunk)
    this.executePendingJob()
  }

  stop = () => {
    if (!this.running) {
      this.logger.warn(`${this.name} is not running; cannot stop a stopped ${this.name}'`)
      return
    }

    this.pendingJobBuffer = []
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

export const DUMMY_ROLLBAR = {
  info: () => {},
  warn: () => {},
  error: () => {},
}
const DUMMY_SHOW_MESSAGE_BOX = () => {}
const DUMMY_SHOW_ERROR_BOX = () => {}

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
  backupRunner = null
  lastAutoSaveFailed = false
  rollbar = null
  showMessageBox = () => {}
  showErrorBox = () => {}
  lastStateSaved = {}
  lastStateBackedUp = {}
  onSaveBackupError = (errorMessage) => {
    this.rollbar.error({ message: 'BACKUP failed' })
    this.rollbar.warn(errorMessage)
  }
  onSaveBackupSuccess = () => {
    this.logger.info('[file save backup]', 'success')
  }
  onAutoSaveError = (errorMessage) => {
    this.rollbar.warn(errorMessage)
    this.showErrorBox(
      t('Auto-saving failed'),
      t("Saving your file didn't work. Check where it's stored.")
    )
  }
  onAutoSaveWorkedThisTime = () => {
    this.showMessageBox({
      title: t('Auto-saving worked'),
      message: t('Saving worked this time 🎉'),
    })
  }

  constructor(
    getState,
    saveFile,
    backupFile,
    logger,
    saveIntervalMS = DEFAULT_SAVE_INTERVAL_MS,
    backupIntervalMS = DEFAULT_BACKUP_INTERVAL_MS,
    rollbar = DUMMY_ROLLBAR,
    showMessageBox = DUMMY_SHOW_MESSAGE_BOX,
    showErrorBox = DUMMY_SHOW_ERROR_BOX
  ) {
    this.getState = getState
    this.logger = logger
    this.saveFile = saveFile
    this.backupFile = backupFile
    this.rollbar = rollbar
    this.showMessageBox = showMessageBox
    this.showErrorBox = showErrorBox

    this.saveRunner = new PressureControlledTaskQueue(
      'Save',
      () => {
        const currentState = this.getState()
        const currentWithoutSystemKeys = removeSystemKeys(currentState)
        const stateDidNotChange = Object.keys(currentWithoutSystemKeys).every((key) => {
          if (key === 'file') {
            return isEqual(currentWithoutSystemKeys[key], this.lastStateSaved[key])
          }

          return currentWithoutSystemKeys[key] === this.lastStateSaved[key]
        })
        if (stateDidNotChange) {
          this.logger.info('State did not change.  Next save will not actually save')
          return () => {
            return Promise.resolve()
          }
        }
        this.lastStateSaved = currentWithoutSystemKeys
        return () => {
          return this.saveFile(currentState)
        }
      },
      logger,
      MAX_SAVE_JOBS,
      saveIntervalMS,
      () => {
        if (this.lastAutoSaveFailed) {
          this.lastAutoSaveFailed = false
          this.onAutoSaveWorkedThisTime()
        }
      },
      (error) => {
        this.lastAutoSaveFailed = true
        logger.warn('Failed to autosave', error)
        this.onAutoSaveError(error.message)
      }
    )
    this.saveRunner.start()

    this.backupRunner = new PressureControlledTaskQueue(
      'Backup',
      () => {
        const currentState = this.getState()
        const currentWithoutSystemKeys = removeSystemKeys(currentState)
        const stateDidNotChange = Object.keys(currentWithoutSystemKeys).every((key) => {
          if (key === 'file') {
            return isEqual(currentWithoutSystemKeys[key], this.lastStateSaved[key])
          }

          return currentWithoutSystemKeys[key] === this.lastStateBackedUp[key]
        })
        if (stateDidNotChange) {
          this.logger.info('State did not change.  Next backup will not actually backup')
          return () => {
            return Promise.resolve()
          }
        }
        this.lastStateBackedUp = currentWithoutSystemKeys
        return () => {
          return this.backupFile(currentState)
        }
      },
      logger,
      MAX_SAVE_JOBS,
      backupIntervalMS,
      () => {
        this.onSaveBackupSuccess()
      },
      (error) => {
        this.logger.warn('[file save backup]', error)
        this.onSaveBackupError(error.message)
      }
    )
    this.backupRunner.start()
  }

  cancelAllRemainingRequests = () => {
    this.saveRunner.cancelAllRemainingRequests()
    this.backupRunner.cancelAllRemainingRequests()
  }
}

export default Saver
