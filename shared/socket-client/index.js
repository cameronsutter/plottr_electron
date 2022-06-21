import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'

import {
  PING,
  RM_RF,
  SAVE_FILE,
  SAVE_OFFLINE_FILE,
  FILE_BASENAME,
  READ_FILE,
  AUTO_SAVE_FILE,
  BACKUP_FILE,
  SAVE_BACKUP_ERROR,
  SAVE_BACKUP_SUCCESS,
  AUTO_SAVE_ERROR,
  AUTO_SAVE_WORKED_THIS_TIME,
  AUTO_SAVE_BACKUP_ERROR,
  ENSURE_BACKUP_FULL_PATH,
  ENSURE_BACKUP_TODAY_PATH,
  LOG_INFO,
  LOG_WARN,
  LOG_ERROR,
  FILE_EXISTS,

  // Error reply types
  RM_RF_ERROR_REPLY,
  SAVE_FILE_ERROR_REPLY,
  SAVE_OFFLINE_FILE_ERROR_REPLY,
  FILE_BASENAME_ERROR_REPLY,
  READ_FILE_ERROR_REPLY,
  BACKUP_FILE_ERROR_REPLY,
  AUTO_SAVE_FILE_ERROR_REPLY,
  ENSURE_BACKUP_FULL_PATH_ERROR_REPLY,
  ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY,
  FILE_EXISTS_ERROR_REPLY,
} from '../socket-server-message-types'
import { setPort, getPort } from './workerPort'

const defer =
  typeof process === 'object' && process.type === 'renderer'
    ? window.requestIdleCallback
    : (f) => {
        setTimeout(f, 0)
      }

const connect = (
  port,
  logger,
  {
    onSaveBackupError,
    onSaveBackupSuccess,
    onAutoSaveError,
    onAutoSaveWorkedThisTime,
    onAutoSaveBackupError,
  }
) => {
  try {
    const clientConnection = new WebSocket(`ws://localhost:${port}`)
    const promises = new Map()

    const sendPromise = (type, payload) => {
      const messageId = uuidv4()
      const reply = new Promise((resolve, reject) => {
        try {
          clientConnection.send(
            JSON.stringify({
              type,
              messageId,
              payload,
            })
          )
          promises.set(messageId, { resolve, reject })
        } catch (error) {
          reject(error)
        }
      })
      return reply
    }

    clientConnection.on('message', (data) => {
      try {
        const { type, payload, messageId, result } = JSON.parse(data)
        const resolvePromise = () => {
          const unresolvedPromise = promises.get(messageId)
          if (!unresolvedPromise) {
            logger.error(
              `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
            )
            return
          }
          promises.delete(messageId)
          unresolvedPromise.resolve(result)
        }

        const rejectPromise = () => {
          const unresolvedPromise = promises.get(messageId)
          if (!unresolvedPromise) {
            logger.error(
              `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
            )
            return
          }
          promises.delete(messageId)
          unresolvedPromise.reject(result)
        }

        switch (type) {
          // Additional replies (i.e. these might happen in addition
          // to the normal/happy path):
          case SAVE_BACKUP_ERROR: {
            if (onSaveBackupError) {
              const [filePath, errorMessage] = result
              onSaveBackupError(filePath, errorMessage)
            }
            return
          }
          case SAVE_BACKUP_SUCCESS: {
            if (onSaveBackupSuccess) {
              const [filePath] = result
              onSaveBackupSuccess(filePath)
            }
            return
          }
          case AUTO_SAVE_ERROR: {
            if (onAutoSaveError) {
              const [filePath, errorMessage] = result
              onAutoSaveError(filePath, errorMessage)
            }
            return
          }
          case AUTO_SAVE_WORKED_THIS_TIME: {
            if (onAutoSaveWorkedThisTime) {
              onAutoSaveWorkedThisTime()
            }
            return
          }
          case AUTO_SAVE_BACKUP_ERROR: {
            if (onAutoSaveBackupError) {
              const [backupFilePath, backupErrorMessage] = result
              onAutoSaveBackupError(backupFilePath, backupErrorMessage)
            }
            return
          }
          // Normal replies
          case FILE_EXISTS:
          case ENSURE_BACKUP_FULL_PATH:
          case ENSURE_BACKUP_TODAY_PATH:
          case AUTO_SAVE_FILE:
          case BACKUP_FILE:
          case READ_FILE:
          case FILE_BASENAME:
          case SAVE_OFFLINE_FILE:
          case SAVE_FILE:
          case RM_RF:
          case PING: {
            resolvePromise()
            return
          }
          // Logging
          case LOG_INFO: {
            logger.info(result, type)
            return
          }
          case LOG_WARN: {
            logger.warn(result, type)
            return
          }
          case LOG_ERROR: {
            logger.error(result, type)
            return
          }
          // Error return types
          case RM_RF_ERROR_REPLY:
          case SAVE_FILE_ERROR_REPLY:
          case SAVE_OFFLINE_FILE_ERROR_REPLY:
          case FILE_BASENAME_ERROR_REPLY:
          case READ_FILE_ERROR_REPLY:
          case BACKUP_FILE_ERROR_REPLY:
          case AUTO_SAVE_FILE_ERROR_REPLY:
          case ENSURE_BACKUP_FULL_PATH_ERROR_REPLY:
          case ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY:
          case FILE_EXISTS_ERROR_REPLY: {
            rejectPromise()
            return
          }
        }

        logger.error(
          `Unknown message type reply: ${type}, with payload: ${payload} and id: ${messageId}`
        )
      } catch (error) {
        logger.error('Error while replying: ', error.message)
      }
    })

    const ping = () => {
      return sendPromise(PING, {})
    }

    const rmRf = (path) => {
      return sendPromise(RM_RF, { path })
    }

    const saveFile = (filePath, file) => {
      return sendPromise(SAVE_FILE, { filePath, file })
    }

    const saveOfflineFile = (file) => {
      return sendPromise(SAVE_OFFLINE_FILE, { file })
    }

    const basename = (filePath) => {
      return sendPromise(FILE_BASENAME, { filePath })
    }

    const readFile = (filePath) => {
      return sendPromise(READ_FILE, { filePath })
    }

    const autoSave = (filePath, file, userId, previousFile) => {
      return sendPromise(AUTO_SAVE_FILE, { filePath, file, userId, previousFile })
    }

    const saveBackup = (filePath, file) => {
      return sendPromise(BACKUP_FILE, { filePath, file })
    }

    const ensureBackupFullPath = () => {
      return sendPromise(ENSURE_BACKUP_FULL_PATH)
    }

    const ensureBackupTodayPath = () => {
      return sendPromise(ENSURE_BACKUP_TODAY_PATH)
    }

    const fileExists = (filePath) => {
      return sendPromise(FILE_EXISTS, { filePath })
    }

    return new Promise((resolve, reject) => {
      clientConnection.on('open', () => {
        resolve({
          ping,
          rmRf,
          saveFile,
          saveOfflineFile,
          basename,
          readFile,
          autoSave,
          saveBackup,
          ensureBackupFullPath,
          ensureBackupTodayPath,
          fileExists,
          close: clientConnection.close.bind(clientConnection),
        })
      })
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

const instance = () => {
  let initialised = false
  let client = null
  let resolvedPromise = null
  let resolve = null
  let reject = null
  let logger = null

  // See the destructured argument of the connect function for the
  // structure of `eventHandlers`.
  const createClient = (port, logger, onFailedToConnect, eventHandlers) => {
    initialised = true
    connect(port, logger, eventHandlers)
      .then((newClient) => {
        if (client) client.close(0, 'New client requested')
        client = newClient
        if (resolve) resolve(newClient)
      })
      .catch((error) => {
        if (error) {
          logger.error('Failed to connect to web socket server: ', error)
          onFailedToConnect(error)
          reject(error)
        }
      })
  }

  const whenClientIsReady = (f) => {
    if (client) {
      return new Promise((resolve, reject) => {
        defer(() => {
          const result = f(client)
          try {
            if (typeof result.then === 'function') {
              result.then(resolve, reject)
            } else {
              resolve(result)
            }
          } catch (error) {
            if (logger) {
              logger.error('Error while using client: ', error)
            }
          }
        })
      })
    }
    if (resolvedPromise) {
      return resolvedPromise.then(() => {
        return f(client)
      })
    }
    resolvedPromise = new Promise((newResolve, newReject) => {
      resolve = newResolve
      reject = newReject
    })
    return resolvedPromise.then(() => {
      return f(client)
    })
  }

  const isInitialised = () => {
    return initialised
  }

  return {
    createClient,
    whenClientIsReady,
    isInitialised,
  }
}

const { createClient, isInitialised, whenClientIsReady } = instance()

export { createClient, isInitialised, whenClientIsReady, setPort, getPort }
