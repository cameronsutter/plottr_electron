import { difference } from 'lodash'

import { selectors, SYSTEM_REDUCER_KEYS, emptyFile } from 'pltr/v2'

const emptyFileState = emptyFile('DummyFile', '2022.11.2')

export const saveFile = (whenClientIsReady, logger) => (state) => {
  return whenClientIsReady(({ saveFile, saveOfflineFile }) => {
    const hasAllKeys = selectors.hasAllKeysSelector(state)
    if (!hasAllKeys) {
      const withoutSystemKeys = difference(Object.keys(state), SYSTEM_REDUCER_KEYS)
      const missing = difference(Object.keys(emptyFileState), withoutSystemKeys)
      const message = `File is missing keys (${missing}).  Refusing to save.`
      logger.error('Missing keys', new Error(message))
      return Promise.reject(message)
    }
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
