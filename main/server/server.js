import { WebSocketServer } from 'ws'
import fs from 'fs'

import { PING, RM_RF } from './message-types'
import { logger } from './logger'

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
          case RM_RF: {
            logger.info('Deleting: ', payload)
            rm(payload.path, { recursive: true })
              .then(() => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    payload: {},
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
