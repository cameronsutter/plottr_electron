import { shouldIgnoreAction } from './shouldIgnoreAction'

const logger = (store) => (next) => (action) => {
  if (LOGGER === 'true') {
    if (shouldIgnoreAction(action)) return next(action)
    console.info('----------')
    console.info(`action: ${action.type}, payload: `, action)
    console.info('before', store.getState())
    const result = next(action)
    console.info('after', store.getState())
    return result
  } else {
    return next(action)
  }
}

export default logger
