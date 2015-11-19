import ipc from 'ipc'

const saver = store => next => action => {
  ipc.send('save-state', store.getState())
  return next(action)
}

export default saver
