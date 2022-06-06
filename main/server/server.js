import { WebSocketServer } from 'ws'
import fs from 'fs'

import {
  FILE_BASENAME,
  PING,
  RM_RF,
  SAVE_FILE,
  SAVE_OFFLINE_FILE,
} from '../../shared/socket-server-message-types'
import { logger } from './logger'
import FileModule from './files'

const parseArgs = () => {
  return {
    port: process.argv[2],
    userDataPath: process.argv[3],
  }
}

const { rm } = fs.promises

const setupListeners = (port, userDataPath) => {
  const { saveFile, saveOfflineFile, basename } = FileModule(userDataPath)

  logger.info(`Starting server on port: ${port}`)
  const webSocketServer = new WebSocketServer({ host: 'localhost', port })

  webSocketServer.on('connection', (webSocket) => {
    webSocket.on('message', (message) => {
      try {
        const { type, messageId, payload } = JSON.parse(message)
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
            logger.info('Saving (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
              filePath: payload.file.filePath,
            })
            const { filePath, file } = payload
            saveFile(filePath, file).then((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
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
            saveOfflineFile(file).then((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
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
          }
        }
      } catch (error) {
        logger.error('Failed to handle message: ', message, error)
      }
    })
  })

  process.send('ready')
}

const startServer = () => {
  const { port, userDataPath } = parseArgs()
  logger.info('args', process.argv)
  setupListeners(port, userDataPath)
}

startServer()
