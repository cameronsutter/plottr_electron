import path from 'path'
import fs from 'fs'
import Store from '../lib/store'
import log from 'electron-log'
import { app, ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { addToKnownFiles, addToKnown } from './known_files'
import { importFromSnowflake, importFromScrivener } from 'plottr_import_export'

import { emptyFile, tree, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { openProjectWindow } from './windows/projects'
import { shell } from 'electron'
import { broadcastToAllWindows } from './broadcast'
import { OFFLINE_FILE_FILES_PATH, isOfflineFile } from './offlineFilePath'
import { whenClientIsReady } from '../../shared/socket-client'
import logger from '../../shared/logger'

const { lstat, writeFile } = fs.promises

const makeFileModule = () => {
  const TMP_PATH = 'tmp'
  const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

  const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH
  const tempFilesStore = new Store(app.getPath('userData'), log, {
    name: tempPath,
    watch: true,
  })

  const saveFile = (filePath, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, jsonData)
    })
  }

  const fileExists = (filePath) => {
    return whenClientIsReady(({ fileExists }) => {
      return fileExists(filePath)
    })
  }

  function removeFromTempFiles(filePath, doDelete = true) {
    const tmpFiles = tempFilesStore.get()
    const key = Object.keys(tmpFiles).find((id) => tmpFiles[id].filePath == filePath)
    tempFilesStore.delete(key)
    // delete the real file
    try {
      if (doDelete) shell.trashItem(filePath, true)
      broadcastToAllWindows('reload-recents')
    } catch (error) {
      log.warn(error)
    }
  }

  function editKnownFilePath(oldPath, newPath) {
    return whenClientIsReady(({ editKnownFilePath }) => {
      return editKnownFilePath(oldPath, newPath)
    })
  }

  const MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME = 10

  async function saveToTempFile(json, name) {
    const maxKey = Object.keys(tempFilesStore.store)
      .map((x) => parseInt(x))
      .reduce((acc, next) => Math.max(next, acc), 0)
    const tempId = maxKey + 1
    const fileName = name || `${t('Untitled')}${tempId == 1 ? '' : tempId}`
    const tempName = `${fileName}.pltr`
    let counter = 1
    let filePath = path.join(TEMP_FILES_PATH, tempName)
    let exists = await fileExists(filePath)
    while (exists) {
      log.warn(`Temp file exists at ${filePath}.  Attempting to create a new name`)
      const tempName = `${fileName}-${uuidv4()}.pltr`
      filePath = path.join(TEMP_FILES_PATH, tempName)
      if (counter > MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME) {
        const errorMessage = `We couldn't save your file to ${filePath}`
        log.error(errorMessage, 'reached max attempts to find unique file name')
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
        log.error(errorMessage, `file doesn't exist after creating it`)
        throw new Error(errorMessage)
      }
    }
    if (stats && stats.isFile(filePath)) {
      const errorMessage = `File: ${filePath} already exists.`
      log.error(errorMessage)
      throw new Error(errorMessage)
    }
    tempFilesStore.set(`${tempId}`, { filePath })
    await saveFile(filePath, json)
    return filePath
  }

  function newFileFromTemplate(template, name) {
    if (!name) {
      return template
    }

    return {
      ...template,
      series: {
        ...template.series,
        name,
      },
    }
  }

  async function createNew(template, name) {
    if (template) {
      const templateFileJSON = newFileFromTemplate(template, name)
      const fileName = name || t('Untitled')
      if (templateFileJSON.books[1]) {
        templateFileJSON.books[1].title = fileName
      }
      const filePath = await saveToTempFile(templateFileJSON, name)
      const fileId = addToKnownFiles(filePath)
      try {
        await openKnownFile(filePath, fileId)
      } catch (error) {
        log.error('Failed to create a new file', name, error)
        throw error
      }
    } else {
      const fileName = name || t('Untitled')
      const emptyPlottrFile = emptyFile(fileName, app.getVersion())
      const filePath = await saveToTempFile(emptyPlottrFile, name)
      const fileId = addToKnownFiles(filePath)
      try {
        await openKnownFile(filePath, fileId)
      } catch (error) {
        log.error('Failed to create a new file', name, error)
        throw error
      }
    }
  }

  async function createFromSnowflake(importedPath, sender, isLoggedIntoPro) {
    const storyName = path.basename(importedPath, '.snowXML')
    let json = emptyFile(storyName, app.getVersion())
    // clear beats and lines
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJson = importFromSnowflake(importedPath, true, json)

    if (isLoggedIntoPro) {
      sender.send('create-plottr-cloud-file', importedJson, storyName)
      return Promise.resolve()
    }

    const filePath = await saveToTempFile(importedJson, storyName)
    const fileId = addToKnownFiles(filePath)
    try {
      await openKnownFile(filePath, fileId)
    } catch (error) {
      log.error('Failed to create file from snowflake', error)
      throw error
    }
    return true
  }

  function createRTFConversionFunction(sender) {
    return function (rtfString) {
      return new Promise((resolve, reject) => {
        const conversionId = uuidv4()
        sender.send('convert-rtf-string-to-slate', rtfString, conversionId)
        ipcMain.once(conversionId, (_event, slate) => {
          resolve(slate)
        })
      })
    }
  }

  function createFromScrivener(importedPath, sender, isLoggedIntoPro, destinationFile) {
    const storyName = path.basename(importedPath, '.scriv')
    let json = emptyFile(storyName, app.getVersion())
    const isScrivener = true
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJsonPromise = importFromScrivener(
      importedPath,
      true,
      json,
      createRTFConversionFunction(sender)
    )

    if (isLoggedIntoPro) {
      importedJsonPromise
        .then((importedJson) => {
          sender.send('create-plottr-cloud-file', importedJson, storyName, isScrivener)
        })
        .catch((error) => {
          return sender.send('error-importing-scrivener', error)
        })
      return Promise.resolve()
    }

    return importedJsonPromise.then((importedJson) => {
      if (destinationFile) {
        return writeFile(destinationFile, JSON.stringify(importedJson, null, 2)).then(() => {
          // Right now, this is only used for testing so we want to quit when we're done.
          log.info(`Finished importing from ${importedPath} to ${destinationFile}`)
          app.quit()
        })
      } else {
        return saveToTempFile(importedJson, storyName)
          .then((filePath) => {
            const fileId = addToKnownFiles(filePath)
            return openKnownFile(filePath, fileId)
              .then(() => {
                log.info('Opened file from imported scrivener data', storyName)
                sender.send('finish-creating-local-scrivener-imported-file')
                return true
              })
              .catch((error) => {
                sender.send('error-importing-scrivener', error)
                log.error('Failed to open a known file after importing from scrivener', error)
                return Promise.reject(error)
              })
          })
          .catch((error) => {
            log.error('Failed to save imported scrivener file', error)
            sender.send('error-importing-scrivener', error)
          })
      }
    })
  }

  function openKnownFile(filePath, id, unknown) {
    if (id && filePath && !filePath.startsWith('plottr://')) {
      // update lastOpen, but wait a little so the file doesn't move from under their mouse
      setTimeout(() => {
        if (isOfflineFile(filePath)) {
          log.info('Opening offline file', filePath)
          return
        }
        whenClientIsReady(({ updateLastOpenedDate }) => {
          return updateLastOpenedDate(id)
        })
          .then(() => {
            broadcastToAllWindows('reload-recents')
          })
          .catch((error) => {
            logger.error('Failed to update a known files last opened date', id, filePath, error)
          })
      }, 500)
    }
    return openProjectWindow(filePath)
      .then(() => {
        log.info('Opened known file for', filePath)
        if (unknown) addToKnown(filePath)
      })
      .catch((error) => {
        log.error('Failed to open a project window for know file', filePath)
        return Promise.reject(error)
      })
  }

  return {
    TMP_PATH,
    TEMP_FILES_PATH,
    tempFilesStore,
    saveFile,
    editKnownFilePath,
    removeFromTempFiles,
    createNew,
    createFromSnowflake,
    createFromScrivener,
    openKnownFile,
  }
}

const {
  TMP_PATH,
  TEMP_FILES_PATH,
  tempFilesStore,
  saveFile,
  editKnownFilePath,
  removeFromTempFiles,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openKnownFile,
} = makeFileModule()

export {
  TMP_PATH,
  TEMP_FILES_PATH,
  tempFilesStore,
  saveFile,
  editKnownFilePath,
  removeFromTempFiles,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openKnownFile,
}
