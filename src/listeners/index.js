import * as fileSystemListeners from './file-system-listeners'

const connectListenersToRedux = (store) => {
  const unsubScribeToTrialChanges = fileSystemListeners.publishTrialChangesToRedux(store)

  return () => {
    unsubScribeToTrialChanges()
  }
}

export default connectListenersToRedux
