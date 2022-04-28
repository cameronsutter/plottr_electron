import http from 'http'
import { WebSocketServer } from 'ws'

import { logger } from './logger'

const parseArgs = () => {
  return {
    port: process.argv[2],
  }
}

const setupListeners = (port) => {
  logger.info(`Starting server on port: ${port}`)
  const webSocketServer = new WebSocketServer({ host: 'localhost', port })

  webSocketServer.on('connection', (webSocket) => {
    webSocket.on('message', (message) => {
      logger.info('Message: ', message)
      webSocket.send(`Echo back: ${message}`)
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
