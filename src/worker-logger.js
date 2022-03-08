import { LOG_FROM_WORKER } from './firebase-messages'

export const logger = {
  info: (...args) => {
    self.postMessage({
      type: LOG_FROM_WORKER,
      payload: {
        level: 'info',
        args,
      },
    })
  },
  warn: (...args) => {
    self.postMessage({
      type: LOG_FROM_WORKER,
      payload: {
        level: 'warn',
        args,
      },
    })
  },
  error: (...args) => {
    self.postMessage({
      type: LOG_FROM_WORKER,
      payload: {
        level: 'error',
        args,
      },
    })
  },
}
