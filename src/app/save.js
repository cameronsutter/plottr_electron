import { selectors } from 'pltr/v2'

export const saveFile = (whenClientIsReady, logger) => (state) => {
  return whenClientIsReady(({ saveFile }) => {
    const canSave = selectors.canSaveSelector(state)
    if (!canSave) {
      logger.warn('File is in a state that prohibits saving.  Refusing to auto-save.')
      return Promise.resolve()
    }

    return saveFile(state)
  })
}

export const backupFile = (whenClientIsReady) => (fullState) => {}
