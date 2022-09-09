import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { TEMP_FILES_PATH } from './stores'

const { lstat, mkdir } = fs.promises

const MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME = 10

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

  async function saveToTempFile(json, name) {
    // Does the tmp file directory exist?
    try {
      await lstat(tempFilesFullPath)
    } catch (error) {
      logger.info(`Temp file directory ${tempFilesFullPath} doesn't exist.  Creating it.`)
      if (error.code === 'ENOENT') {
        await mkdir(tempFilesFullPath, { recursive: true })
      }
      logger.error('Could not create temp file path', error)
      throw error
    }

    const store = await tempFilesStore.currentStore()
    const maxCount = Object.values(store)
      .map(({ fileName }) => {
        const digits = fileName.match(/[0-9]+$/)
        if (digits && digits[0]) {
          return [parseInt(digits[0])]
        }
        return []
      })
      .flatMap((x) => x)
      .reduce((acc, next) => Math.max(next, acc), 0)
    const tempFileCount = maxCount + 1
    const fileName = name || `${t('Untitled')}${tempFileCount == 1 ? '' : tempFileCount}`
    const tempName = `${fileName}.pltr`
    let counter = 1
    let filePath = path.join(tempFilesFullPath, tempName)
    let exists = await fileExists(filePath)
    while (exists) {
      logger.warn(`Temp file exists at ${filePath}.  Attempting to create a new name`)
      const tempName = `${fileName}-${uuidv4()}.pltr`
      filePath = path.join(tempFilesFullPath, tempName)
      if (counter > MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME) {
        const errorMessage = `We couldn't save your file to ${filePath}`
        logger.error(errorMessage, 'reached max attempts to find unique file name')
        throw new Error(errorMessage)
      }
      counter++
      exists = await fileExists(filePath)
    }
    let stats
    try {
      stats = await lstat(filePath)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        const errorMessage = `We couldn't save your file to ${filePath}.`
        logger.error(errorMessage, `file doesn't exist after creating it`)
        throw new Error(errorMessage)
      }
    }
    if (stats && stats.isFile(filePath)) {
      const errorMessage = `File: ${filePath} already exists.`
      logger.error(errorMessage)
      throw new Error(errorMessage)
    }
    const fileURL = helpers.file.filePathToFileURL(filePath)
    if (!fileURL) {
      const message = `Couldn't compute a file URL for temp file that we're trying to save to ${filePath}`
      logger.error(message)
      throw new Error(message)
    }
    await tempFilesStore.set(fileURL, { fileURL })
    await saveFile(fileURL, json)
    return fileURL
  }

  return {
    removeFromTempFiles,
    saveToTempFile,
  }
}

export default makeTempFilesModule
