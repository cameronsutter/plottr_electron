import { actions } from 'pltr/v2'

import { fileSystemAPIs } from '../api'

export const publishTrialChangesToRedux = (store) => {
  const action = actions.license.setTrialInfo
  store.dispatch(action(fileSystemAPIs.currentTrialValue()))
  return fileSystemAPIs.listenToTrialChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}
