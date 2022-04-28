import WebSocket from 'ws'
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid'

import { PING } from './messageTypes'

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

  return {
    ping,
  }
}
