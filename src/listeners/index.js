import * as fileSystemListeners from './file-system-listeners'

const connectListenersToRedux = (store) => {
  const unsubscribeToTrialChanges = fileSystemListeners.publishTrialChangesToRedux(store)
  const unsubscribeToLicenseChanges = fileSystemListeners.publishLicenseChangesToRedux(store)

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
  }
}

export default connectListenersToRedux
