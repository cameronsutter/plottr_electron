import WebSocket from 'ws'
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid'

import { PING, RM_RF } from './socket-server-message-types'
import { logger } from './logger'

export const connect = (port) => {
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

  return new Promise((resolve, reject) => {
    clientConnection.on('open', () => {
      resolve({
        ping,
        rmRf,
      })
    })
  })
}

const instance = () => {
  let client = null
  let resolvedPromise = null
  let resolve = null
  let reject = null

  const createClient = (port) => {
    connect(port)
      .then((newClient) => {
        client = newClient
        if (resolve) resolve(newClient)
      })
      .catch(reject)
  }

  const checkClient = () => {
    if (client === null) {
      throw new Error('Socket server not yet ready.')
    }
  }

  const getClient = () => {
    checkClient()
    return client
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

  return {
    createClient,
    getClient,
    whenClientIsReady,
  }
}

const { createClient, getClient, whenClientIsReady } = instance()

export { createClient, getClient, whenClientIsReady }
