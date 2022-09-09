import path, { basename } from 'path'

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

    const fileName = basename(helpers.file.withoutProtocol(fileURL), 'pltr')
    return knownFilesStore
      .set(fileURL, {
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

    const fileName = basename(helpers.file.withoutProtocol(fileURL), 'pltr')
    return knownFilesStore
      .set(fileURL, {
        fileURL,
        fileName,
        lastOpened: Date.now(),
      })
      .catch((error) => {
        logger.error('Error reading the known files store to add a known file', fileURL, error)
        return Promise.reject(error)
      })
  }

  const editKnownFilePath = (oldFilePath, newFilePath) => {
    if (!oldFilePath || !newFilePath) {
      const message = `Tried to edit a known file's path from ${oldFilePath} to ${newFilePath}`
      logger.error(message)
      return Promise.reject(new Error(message))
    }
    const oldFileURL = helpers.file.filePathToFileURL(oldFilePath)
    const newFileURL = helpers.file.filePathToFileURL(newFilePath)
    const fileRecord = knownFilesStore.get(oldFileURL)
    return knownFilesStore
      .delete(oldFileURL)
      .then(() => {
        return knownFilesStore.set(newFileURL, {
          ...fileRecord,
          fileURL: newFileURL,
        })
      })
      .catch((error) => {
        logger.error(`Error editing known file path from ${oldFilePath} to ${newFilePath}: `, error)
        return Promise.reject(error)
      })
  }

  const updateLastOpenedDate = (fileURL) => {
    return knownFilesStore.set(`${fileURL}.lastOpened`, Date.now())
  }

  const updateKnownFileName = (fileURL, newName) => {
    return knownFilesStore.set(`${fileURL}.fileName`, newName)
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
