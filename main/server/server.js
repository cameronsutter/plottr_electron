import { WebSocketServer } from 'ws'
import fs from 'fs'

import {
  FILE_BASENAME,
  PING,
  READ_FILE,
  RM_RF,
  SAVE_FILE,
  SAVE_OFFLINE_FILE,
  BACKUP_FILE,
  AUTO_SAVE_FILE,
  SAVE_BACKUP_ERROR,
  SAVE_BACKUP_SUCCESS,
  ENSURE_BACKUP_FULL_PATH,
  ENSURE_BACKUP_TODAY_PATH,
  FILE_EXISTS,
  BACKUP_OFFLINE_BACKUP_FOR_RESUME,
} from '../../shared/socket-server-message-types'
import { makeLogger } from './logger'
import FileModule from './files'
import BackupModule from './backup'

const parseArgs = () => {
  return {
    port: process.argv[2],
    userDataPath: process.argv[3],
  }
}

const { rm } = fs.promises

const setupListeners = (port, userDataPath) => {
  process.send(`Starting server on port: ${port}`)
  const webSocketServer = new WebSocketServer({ host: 'localhost', port })

  webSocketServer.on('connection', (webSocket) => {
    const logger = makeLogger(webSocket)

    const {
      saveFile,
      saveOfflineFile,
      basename,
      readFile,
      autoSave,
      fileExists,
      backupOfflineBackupForResume,
    } = FileModule(userDataPath, logger)
    const { saveBackup, ensureBackupTodayPath } = BackupModule(userDataPath, logger)

    // FIXME: we should reply with an error when the action fails so
    // that we can fail the promise in the client (like we do for the
    // Firebase client).
    webSocket.on('message', (message) => {
      try {
        const { type, messageId, payload } = JSON.parse(message)

        const send = (type, ...args) => {
          try {
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                result: args,
                payload,
              })
            )
          } catch (error) {
            logger.error('Error sending a message back to the socket client')
          }
        }

        const typeToErrorReplyType = (type) => {
          return `${type}_ERROR_REPLY`
        }

        const replyWithErrorMessage = (errorMessage) => {
          webSocket.send(
            JSON.stringify({
              type: typeToErrorReplyType(type),
              messageId,
              payload,
              result: errorMessage,
            })
          )
        }

        switch (type) {
          case PING: {
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                payload,
              })
            )
            return
          }
          case SAVE_FILE: {
            const { filePath, file } = payload
            logger.info('Saving (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
              filePath: filePath,
            })
            saveFile(filePath, file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving file ', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case RM_RF: {
            logger.info('Deleting: ', payload)
            rm(payload.path, { recursive: true })
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    payload,
                    result,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while deleting ', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case SAVE_OFFLINE_FILE: {
            logger.info('Saving offline file (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
            })
            const { file } = payload
            saveOfflineFile(file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving offline ', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case FILE_BASENAME: {
            logger.info('Computing basename for: ', payload)
            const { filePath } = payload
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                result: basename(filePath),
                payload,
              })
            )
            return
          }
          case READ_FILE: {
            logger.info('Reading a file at path: ', payload)
            const { filePath } = payload
            readFile(filePath)
              .then((fileData) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result: JSON.parse(fileData),
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while reading a file', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case BACKUP_FILE: {
            const { filePath, file } = payload
            logger.info('Backing up file (reduced payload): ', {
              file: {
                ...file.file,
              },
              filePath: filePath,
            })
            saveBackup(filePath, file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
                send(SAVE_BACKUP_SUCCESS, filePath)
              })
              .catch((error) => {
                logger.error('Error while saving a backup ', payload.file.file, error)
                send(SAVE_BACKUP_ERROR, filePath, error.message)
              })
            return
          }
          case AUTO_SAVE_FILE: {
            const { filePath, file, userId, previousFile } = payload
            logger.info('Auto-saving file (reduced payload): ', {
              file: {
                ...file.file,
              },
              filePath,
              previousFile: {
                ...previousFile.file,
              },
              userId,
            })
            autoSave(send, filePath, file, userId, previousFile)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while auto saving', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case ENSURE_BACKUP_FULL_PATH: {
            logger.info(
              'Ensuring that the full backup path exists (same op. as ensuring backup path for today.)'
            )
            try {
              const result = ensureBackupTodayPath()
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            } catch (error) {
              logger.error('Error ensuring the full backup path exists', error)
              replyWithErrorMessage(error.message)
            }
            return
          }
          case ENSURE_BACKUP_TODAY_PATH: {
            logger.info('Ensuring that the backup path exists for today.')
            try {
              const result = ensureBackupTodayPath()
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result: result,
                  payload,
                })
              )
            } catch (error) {
              logger.error('Error ensuring the backup path for today', error)
              replyWithErrorMessage(error.message)
            }
            return
          }
          case FILE_EXISTS: {
            const { filePath } = payload
            logger.info(`Checking whether a file exists at: ${filePath}`)
            fileExists(filePath)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result: result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while checking whether a file exists', filePath, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case BACKUP_OFFLINE_BACKUP_FOR_RESUME: {
            logger.info('Backing up offline file for resume (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
            })
            const { file } = payload
            backupOfflineBackupForResume(file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving offline backup file for resuming', payload, error)
              })
          }
        }
      } catch (error) {
        logger.error('Failed to handle message: ', message.toString().substring(0, 50), error)
      }
    })
  })

  process.send('ready')
}

const startServer = () => {
  const { port, userDataPath } = parseArgs()
  process.send(`args: ${process.argv}`)
  setupListeners(port, userDataPath)
}

startServer()
