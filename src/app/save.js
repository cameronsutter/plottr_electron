import { selectors } from 'pltr/v2'

export const saveFile = (whenClientIsReady, logger) => (state) => {
  return whenClientIsReady(({ saveFile, saveOfflineFile }) => {
    const canSave = selectors.canSaveSelector(state)
    if (!canSave) {
      logger.warn('File is in a state that prohibits saving.  Refusing to auto-save.')
      return Promise.resolve()
    }

    const shouldSaveOfflineFile = selectors.shouldSaveOfflineFileSelector(state)
    if (shouldSaveOfflineFile) {
      return saveOfflineFile(state)
    }

    return saveFile(state)
  })
}

export const backupFile = (whenClientIsReady, logger) => (fullState) => {
  return Promise.resolve()
}
