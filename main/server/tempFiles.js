import fs from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { TEMP_FILES_PATH } from './stores'

const { lstat, mkdir } = fs.promises

const MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME = 50

const makeTempFilesModule = (userDataPath, stores, fileModule, trashModule, logger) => {
  const { tempFilesStore } = stores
  const { fileExists, saveFile } = fileModule
  const { trash } = trashModule

  const tempFilesFullPath = path.join(userDataPath, TEMP_FILES_PATH)

  function removeFromTempFiles(fileURL, doDelete = true) {
    return tempFilesStore.delete(fileURL).then(() => {
      return doDelete ? trash(helpers.file.withoutProtocol(fileURL)) : Promise.resolve(true)
    })
  }

  function uniqueTempFilePath(fileName) {
    function iter(counter, filePath) {
      if (counter > MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME) {
        const errorMessage = `We couldn't save your file to ${filePath}`
        logger.error(errorMessage, 'reached max attempts to find unique file name')
        return Promise.reject(new Error(errorMessage))
      }
      return fileExists(filePath).then((exists) => {
        if (exists) {
          logger.warn(`Temp file exists at ${filePath}.  Attempting to create a new name`)
          const tempName = `${fileName}-${counter + 1}.pltr`
          return iter(counter + 1, path.join(tempFilesFullPath, tempName))
        }

        return filePath
      })
    }

    return iter(0, path.join(tempFilesFullPath, `${fileName}.pltr`)).then((filePath) => {
      return lstat(filePath)
        .then(() => {
          const errorMessage = `File: ${filePath} already exists.`
          logger.error(errorMessage)
          return Promise.reject(new Error(errorMessage))
        })
        .catch((error) => {
          if (error.code === 'ENOENT') {
            return filePath
          }

          const message = `Couldn't create a unique path for temp file ${fileName}`
          logger.error(message, error)
          return Promise.reject(error)
        })
    })
  }

  function ensureTempFilesDirectoryExists() {
    // Does the tmp file directory exist?
    return lstat(tempFilesFullPath).catch((error) => {
      logger.info(`Temp file directory ${tempFilesFullPath} doesn't exist.  Creating it.`)
      if (error.code === 'ENOENT') {
        return mkdir(tempFilesFullPath, { recursive: true })
      }

      logger.error('Could not create temp file path', error)
      return Promise.reject(error)
    })
  }

  function saveToTempFile(json, name) {
    return ensureTempFilesDirectoryExists()
      .then(() => {
        const fileName = name || t('Untitled')
        return fileName
      })
      .then((fileName) => {
        return uniqueTempFilePath(fileName).then((filePath) => {
          const fileURL = helpers.file.filePathToFileURL(filePath)
          if (!fileURL) {
            const message = `Couldn't compute a file URL for temp file that we're trying to save to ${filePath}`
            logger.error(message)
            return Promise.reject(Error(message))
          }
          return tempFilesStore
            .setRawKey(fileURL, { fileURL })
            .then(() => {
              return saveFile(fileURL, json) // Need to make sure these are added to known files
            })
            .then(() => {
              logger.info('Adding to temp file store: ', fileURL, { fileURL })
              return fileURL
            })
        })
      })
  }

  return {
    removeFromTempFiles,
    saveToTempFile,
  }
}

export default makeTempFilesModule
