import { LOG_ERROR, LOG_INFO, LOG_WARN } from '../../shared/socket-server-message-types'

export const makeLogger = (webSocket) => {
  return {
    info: (...args) => {
      webSocket.send(
        JSON.stringify({
          type: LOG_INFO,
          messageId: 'log-message',
          payload: {},
          result: `[Socket Server]: ${JSON.stringify(args, null, 2)}`,
        })
      )
    },
    warn: (...args) => {
      webSocket.send(
        JSON.stringify({
          type: LOG_WARN,
          messageId: 'log-message',
          payload: {},
          result: `[Socket Server]: ${JSON.stringify(args, null, 2)}`,
        })
      )
    },
    error: (...args) => {
      console.error('[Socket Server]: ', JSON.stringify(args, null, 2))
      webSocket.send(
        JSON.stringify({
          type: LOG_ERROR,
          messageId: 'log-message',
          payload: {},
          result: `[Socket Server]: ${JSON.stringify(args, null, 2)}`,
        })
      )
    },
  }
}
