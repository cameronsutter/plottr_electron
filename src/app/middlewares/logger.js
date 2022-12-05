const logger = (store) => (next) => (action) => {
  // eslint-disable-next-line
  if (LOGGER === 'true') {
    console.info('----------START Redux Change Logger START----------')
    console.info(`action: ${action.type}, payload: `, action)
    const oldState = store.getState().present
    const result = next(action)
    const newState = store.getState().present
    Object.keys(oldState).forEach((key) => {
      if (oldState[key] !== newState[key]) {
        console.log(`${key} changed:`)
        console.log('Old', oldState[key])
        console.log('New', newState[key])
      }
    })
    console.info('----------END Redux Change Logger END----------')
    return result
  } else {
    return next(action)
  }
}

export default logger
