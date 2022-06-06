import WebSocket from 'ws'
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid'

import { PING, RM_RF, SAVE_FILE, SAVE_OFFLINE_FILE } from '../socket-server-message-types'
import { setPort, getPort } from './workerPort'

const connect = (port, logger) => {
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
      const { type, payload, messageId } = JSON.parse(data)
      const resolvePromise = () => {
        const unresolvedPromise = promises.get(messageId)
        if (!unresolvedPromise) {
          log.error(
            `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
          )
          return
        }
        promises.delete(messageId)
        unresolvedPromise.resolve(payload)
      }

      switch (type) {
        case SAVE_OFFLINE_FILE:
        case SAVE_FILE:
        case RM_RF:
        case PING: {
          resolvePromise()
          return
        }
      }

      log.error(
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

  return new Promise((resolve, reject) => {
    clientConnection.on('open', () => {
      resolve({
        ping,
        rmRf,
        saveFile,
        saveOfflineFile,
      })
    })
  })
}

const instance = () => {
  let initialised = false
  let client = null
  let resolvedPromise = null
  let resolve = null
  let reject = null

  const createClient = (port, logger) => {
    initialised = true
    connect(port, logger)
      .then((newClient) => {
        if (client) client.close(0, 'New client requested')
        client = newClient
        if (resolve) resolve(newClient)
      })
      .catch((error) => {
        if (error) {
          logger.error('Failed to connect to web socket server: ', error)
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
