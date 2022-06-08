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
} from '../socket-server-message-types'
import { setPort, getPort } from './workerPort'

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

        switch (type) {
          // Additional replies (i.e. these might happen in addition
          // to the normal/happy path):
          case SAVE_BACKUP_ERROR: {
            if (onSaveBackupError) {
              const [filePath, errorMessage] = payload
              onSaveBackupError(filePath, errorMessage)
            }
            return
          }
          case SAVE_BACKUP_SUCCESS: {
            if (onSaveBackupSuccess) {
              const [filePath] = payload
              onSaveBackupSuccess(filePath)
            }
            return
          }
          case AUTO_SAVE_ERROR: {
            if (onAutoSaveError) {
              const [filePath, errorMessage] = payload
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
              const [backupFilePath, backupErrorMessage] = payload
              onAutoSaveBackupError(backupFilePath, backupErrorMessage)
            }
            return
          }
          // Normal replies
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
        }

        logger.error(
          `Unknown message type reply: ${type}, with payload: ${payload} and id: ${messageId}`
        )
      } catch (error) {
        logger.error('Error while replying: ', data, error)
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
        setTimeout(() => {
          const result = f(client)
          if (typeof result.then === 'function') {
            result.then(resolve)
          } else {
            resolve(result)
          }
        }, 0)
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
