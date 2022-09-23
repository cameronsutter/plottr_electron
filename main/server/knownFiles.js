import { basename } from 'path'

import { helpers } from 'pltr/v2'

const makeKnownFilesModule = (
  stores,
  fileModule,
  fileSystemModule,
  tempFilesModule,
  trashModule,
  logger
) => {
  const { knownFilesStore } = stores
  const { offlineFilesFilesPath } = fileModule
  const { TEMP_FILES_PATH } = fileSystemModule
  const { removeFromTempFiles } = tempFilesModule
  const { trash } = trashModule

  const removeFromKnownFiles = (fileURL) => {
    return knownFilesStore.delete(fileURL)
  }

  const deleteKnownFile = (fileURL) => {
    try {
      const filePath = helpers.file.withoutProtocol(fileURL)
      return removeFromKnownFiles(fileURL)
        .then(() => {
          return trash(filePath)
        })
        .then(() => {
          if (filePath.includes(TEMP_FILES_PATH)) {
            return removeFromTempFiles(fileURL, false)
          }
          return true
        })
    } catch (error) {
      logger.warn(error)
      return Promise.reject(error)
    }
  }

  const addKnownFileWithFix = (fileURL) => {
    // We also don't want to track recent files that don't have a path.
    if (!fileURL || fileURL === '') return Promise.resolve()

    // We don't want to track recent files when they're offline files.
    if (helpers.file.withoutProtocol(fileURL).startsWith(offlineFilesFilesPath)) {
      return Promise.resolve()
    }

    const fileName = basename(helpers.file.withoutProtocol(fileURL), '.pltr')
    return knownFilesStore
      .setRawKey(fileURL, {
        fileURL,
        fileName,
        lastOpened: Date.now(),
      })
      .catch((error) => {
        logger.error('Error getting the current store to add a known file', fileURL)
        return Promise.reject(error)
      })
  }

  const addKnownFile = (fileURL) => {
    // We also don't want to track recent files that don't have a path.
    if (!fileURL || fileURL === '') return Promise.resolve()

    // We don't want to track recent files when they're offline files.
    if (helpers.file.withoutProtocol(fileURL).startsWith(offlineFilesFilesPath)) {
      return Promise.resolve()
    }

    const fileName = basename(helpers.file.withoutProtocol(fileURL), '.pltr')
    return knownFilesStore
      .setRawKey(fileURL, {
        fileURL,
        fileName,
        lastOpened: Date.now(),
      })
      .catch((error) => {
        logger.error('Error reading the known files store to add a known file', fileURL, error)
        return Promise.reject(error)
      })
  }

  const editKnownFilePath = (oldFileURL, newFileURL) => {
    if (!oldFileURL || !newFileURL) {
      const message = `Tried to edit a known file's path from ${oldFileURL} to ${newFileURL}`
      logger.error(message)
      return Promise.reject(new Error(message))
    }
    const fileRecord = knownFilesStore.getRawKey(oldFileURL)
    return knownFilesStore
      .delete(oldFileURL)
      .then(() => {
        return knownFilesStore.setRawKey(newFileURL, {
          ...fileRecord,
          fileURL: newFileURL,
          fileName: basename(helpers.file.withoutProtocol(newFileURL), '.pltr'),
        })
      })
      .catch((error) => {
        logger.error(`Error editing known file path from ${oldFileURL} to ${newFileURL}: `, error)
        return Promise.reject(error)
      })
  }

  const updateLastOpenedDate = (fileURL) => {
    const currentValue = knownFilesStore.getRawKey(fileURL)
    return knownFilesStore.setRawKey(fileURL, {
      ...currentValue,
      lastOpened: Date.now(),
    })
  }

  const updateKnownFileName = (fileURL, newName) => {
    const currentValue = knownFilesStore.getRawKey(fileURL)
    return knownFilesStore.setRawKey(fileURL, {
      ...currentValue,
      fileName: newName,
    })
  }

  return {
    removeFromKnownFiles,
    addKnownFileWithFix,
    addKnownFile,
    editKnownFilePath,
    updateLastOpenedDate,
    deleteKnownFile,
    updateKnownFileName,
  }
}

export default makeKnownFilesModule
