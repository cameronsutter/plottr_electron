import { selectors } from 'pltr/v2'
import { shouldIgnoreAction } from './shouldIgnoreAction'

const offlineRecorder = (whenClientIsReady) => {
  let saveTimeout = null
  let resetCount = 0
  const MAX_RESETS = 200

  function saveOfflineBackup(jsonData) {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      resetCount++
    }
    const forceSave = () => {
      whenClientIsReady(({ saveOfflineFile }) => {
        return saveOfflineFile(jsonData)
      })
      resetCount = 0
      saveTimeout = null
    }

    if (resetCount >= MAX_RESETS) {
      forceSave()
      return
    }
    saveTimeout = setTimeout(forceSave, 1000)
  }

  return (store) => (next) => (action) => {
    const result = next(action)

    const state = store.getState().present
    if (
      !shouldIgnoreAction(action) &&
      selectors.isCloudFileSelector(state) &&
      !selectors.isOfflineSelector(state) &&
      !selectors.isResumingSelector(state)
    ) {
      saveOfflineBackup(state)
    }

    return result
  }
}

export default offlineRecorder
