import { WebSocketServer } from 'ws'
import fs from 'fs'

import { PING, RM_RF, SAVE_FILE } from '../../shared/socket-server-message-types'
import { logger } from './logger'
import { saveFile } from './files'

const parseArgs = () => {
  return {
    port: process.argv[2],
  }
}

const { rm } = fs.promises

const setupListeners = (port) => {
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
            logger.info('Saving: ', payload)
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
        }
      } catch (error) {
        logger.error('Failed to handle message: ', message, error)
      }
    })
  })

  process.send('ready')
}

const startServer = () => {
  const { port } = parseArgs()
  logger.info('args', process.argv)
  setupListeners(port)
}

startServer()
