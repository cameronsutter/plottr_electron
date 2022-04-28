import WebSocket from 'ws'
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid'

import { PING } from './socket-server-message-types'

export const connect = (port) => {
  const clientConnection = new WebSocket(`ws://localhost:${port}`)
  const promises = new Map()

  const sendPromise = (type, payload) => {
    const messageId = uuidv4()
    const reply = new Promise((resolve, reject) => {
      try {
        clientConnection.send({
          type,
          messageId,
          payload,
        })
        promises.set(messageId, { resolve, reject })
      } catch (error) {
        reject(error)
      }
    })
    return reply
  }

  clientConnection.on('message', (data) => {
    const { type, payload, messageId } = data
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
      case PING: {
        resolvePromise()
        return
      }
    }

    log.error(`Unknown message type reply: ${type}, with payload: ${payload} and id: ${messageId}`)
  })

  const ping = () => {
    sendPromise(PING, {})
  }

  return new Promise((resolve, reject) => {
    clientConnection.on('open', () => {
      resolve({
        ping,
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
      setTimeout(f, 0)
      return
    }
    if (resolvedPromise) {
      resolvedPromise.then(f)
      return
    }
    resolvedPromise = new Promise((newResolve, newReject) => {
      resolve = newResolve
      reject = newReject
    })
    resolvedPromise.then(f)
  }

  return {
    createClient,
    getClient,
    whenClientIsReady,
  }
}

const { createClient, getClient, whenClientIsReady } = instance()

export { createClient, getClient, whenClientIsReady }
