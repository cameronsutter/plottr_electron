import ipc from 'ipc'

const saver = store => next => action => {
  const result = next(action)
  ipc.send('save-state', store.getState())
  return result
}

export default saver
