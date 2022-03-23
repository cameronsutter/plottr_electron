import { LOG_FROM_WORKER } from './firebase-messages'

export const logger = {
  info: (...args) => {
    try {
      self.postMessage({
        type: LOG_FROM_WORKER,
        payload: {
          level: 'info',
          args: args.map((arg) => JSON.stringify(arg)),
        },
      })
    } catch (error) {
      console.error('Error logging a message', error)
    }
  },
  warn: (...args) => {
    try {
      self.postMessage({
        type: LOG_FROM_WORKER,
        payload: {
          level: 'warn',
          args: args.map((arg) => JSON.stringify(arg)),
        },
      })
    } catch (error) {
      console.error('Error logging a warning', error)
    }
  },
  error: (...args) => {
    try {
      self.postMessage({
        type: LOG_FROM_WORKER,
        payload: {
          level: 'error',
          args: args.map((arg) => JSON.stringify(arg)),
        },
      })
    } catch (error) {
      console.error('Error logging an error', error)
    }
  },
}
