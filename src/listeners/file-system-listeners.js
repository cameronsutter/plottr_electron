import { actions } from 'pltr/v2'

import { fileSystemAPIs } from '../api'

export const publishTrialChangesToRedux = (store) => {
  const action = actions.license.setTrialInfo
  store.dispatch(action(fileSystemAPIs.currentTrialValue()))
  return fileSystemAPIs.listenToTrialChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishLicenseChangesToRedux = (store) => {
  const action = actions.license.setLicenseInfo
  store.dispatch(action(fileSystemAPIs.currentLicenseValue()))
  return fileSystemAPIs.listenToLicenseChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}
