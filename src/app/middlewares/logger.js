const logger = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development' && process.env.LOGGER === 'true') {
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
