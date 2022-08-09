import fs from 'fs'
import path from 'path'
import trash from 'trash'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { TEMP_FILES_PATH } from './stores'

const { lstat, mkdir } = fs.promises

const MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME = 10

const makeTempFilesModule = (userDataPath, stores, fileModule, logger) => {
  const { tempFilesStore } = stores
  const { fileExists, saveFile } = fileModule

  const tempFilesFullPath = path.join(userDataPath, TEMP_FILES_PATH)

  function removeFromTempFiles(filePath, doDelete = true) {
    const tmpFiles = tempFilesStore.get()
    const key = Object.keys(tmpFiles).find((id) => tmpFiles[id].filePath == filePath)
    tempFilesStore.delete(key)
    // delete the real file
    try {
      return doDelete ? trash(filePath) : Promise.resolve()
    } catch (error) {
      logger.warn(error)
      return Promise.reject(error)
    }
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
    }

    const maxKey = Object.keys(tempFilesStore.store)
      .map((x) => parseInt(x))
      .reduce((acc, next) => Math.max(next, acc), 0)
    const tempId = maxKey + 1
    const fileName = name || `${t('Untitled')}${tempId == 1 ? '' : tempId}`
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
    tempFilesStore.set(`${tempId}`, { filePath })
    await saveFile(filePath, json)
    return filePath
  }

  return {
    removeFromTempFiles,
    saveToTempFile,
  }
}

export default makeTempFilesModule
