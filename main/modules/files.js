import path from 'path'
import fs from 'fs'
import Store from 'electron-store'
import log from 'electron-log'
import { app, ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { knownFilesStore, addToKnownFiles, addToKnown } from './known_files'
import { importFromSnowflake, importFromScrivener } from 'plottr_import_export'

import { selectors, emptyFile, tree, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { openProjectWindow } from './windows/projects'
import { shell } from 'electron'
import { broadcastToAllWindows } from './broadcast'
import { saveBackup } from './backup'
import SETTINGS from './settings'
import { OFFLINE_FILE_FILES_PATH, offlineFilePath, isOfflineFile } from './offlineFilePath'
import { whenClientIsReady } from '../../shared/socket-client'

const { unlink, readdir, lstat } = fs.promises

const makeFileModule = () => {
  const TMP_PATH = 'tmp'
  const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

  const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH
  const tempFilesStore = new Store({ name: tempPath, cwd: 'tmp', watch: true })

  const saveFile = (filePath, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, jsonData)
    })
  }

  const autoSaver = () => {
    let itWorkedLastTime = true

    let backupTimeout = null
    let resetCount = 0
    const MAX_ATTEMPTS = 200

    return async function autoSave(event, inputFilePath, file, userId, previousFile) {
      // Don't auto save while resolving resuming the connection
      if (selectors.isResumingSelector(file)) return

      const onCloud = selectors.isCloudFileSelector(file)
      const isOffline = selectors.isOfflineSelector(file)
      const offlineModeEnabled = selectors.offlineModeEnabledSelector(file)
      const filePath =
        onCloud && isOffline && offlineModeEnabled ? offlineFilePath(inputFilePath) : inputFilePath
      if (!onCloud || isOffline) {
        try {
          await saveFile(filePath, file)
          // didn't work last time, but it did this time
          if (!itWorkedLastTime) {
            itWorkedLastTime = true
            event.sender.send('auto-save-worked-this-time')
          }
        } catch (saveError) {
          itWorkedLastTime = false
          event.sender.send('auto-save-error', filePath, saveError)
        }
      }
      // either way, save a backup
      function forceBackup() {
        // save local backup if: 1) not cloud file OR 2) localBackups is on
        if (!onCloud || (onCloud && SETTINGS.get('user.localBackups'))) {
          const backupFilePath = onCloud ? `${file.file.fileName}.pltr` : filePath
          saveBackup(backupFilePath, previousFile || file, (backupError) => {
            if (backupError) {
              event.sender.send('auto-save-backup-error', backupFilePath, backupError)
            }
          })
        }
        backupTimeout = null
        resetCount = 0
      }
      if (backupTimeout) {
        clearTimeout(backupTimeout)
        resetCount++
      }
      if (resetCount >= MAX_ATTEMPTS) {
        forceBackup()
        return
      }
      // NOTE: We want to backup every 60 seconds, but saves only happen
      // every 10 seconds.
      backupTimeout = setTimeout(forceBackup, 59000)
    }
  }
  const autoSave = autoSaver()

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

  function removeFromKnownFiles(id) {
    knownFilesStore.delete(id)
  }

  function deleteKnownFile(id, filePath) {
    if (!filePath) {
      filePath = knownFilesStore.get(`${id}.path`)
    }
    try {
      removeFromKnownFiles(id)
      shell.trashItem(filePath, true)
      if (filePath.includes(TEMP_FILES_PATH)) {
        removeFromTempFiles(filePath, false)
      }
    } catch (error) {
      log.warn(error)
    }
  }

  function editKnownFilePath(oldPath, newPath) {
    const key = Object.keys(knownFilesStore.store).find(
      (id) => path.normalize(knownFilesStore.store[id].path) == path.normalize(oldPath)
    )
    const file = knownFilesStore.get(key)
    knownFilesStore.set(key, {
      ...file,
      path: newPath,
    })
  }

  async function saveToTempFile(json, name) {
    const maxKey = Object.keys(tempFilesStore.store)
      .map((x) => parseInt(x))
      .reduce((acc, next) => Math.max(next, acc), 0)
    const tempId = maxKey + 1
    const fileName = name || `${t('Untitled')}${tempId == 1 ? '' : tempId}`
    const tempName = `${fileName}.pltr`
    const filePath = path.join(TEMP_FILES_PATH, tempName)
    let stats
    try {
      stats = await lstat(filePath)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        const errorMessage = `We couldn't save your file to ${filePath}.`
        log.error(errorMessage)
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
      openKnownFile(filePath, fileId)
    } else {
      const fileName = name || t('Untitled')
      const emptyPlottrFile = emptyFile(fileName, app.getVersion())
      const filePath = await saveToTempFile(emptyPlottrFile, name)
      const fileId = addToKnownFiles(filePath)
      openKnownFile(filePath, fileId)
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
    openKnownFile(filePath, fileId)
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

  function createFromScrivener(importedPath, sender, isLoggedIntoPro) {
    const storyName = path.basename(importedPath, '.scriv')
    let json = emptyFile(storyName, app.getVersion())
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
      importedJsonPromise.then((importedJson) => {
        sender.send('create-plottr-cloud-file', importedJson, storyName)
      })
      return Promise.resolve()
    }

    return importedJsonPromise.then((importedJson) => {
      return saveToTempFile(importedJson, storyName).then((filePath) => {
        const fileId = addToKnownFiles(filePath)
        openKnownFile(filePath, fileId)
        sender.send('finish-creating-local-scrivener-imported-file')
      })
    })
  }

  function openKnownFile(filePath, id, unknown) {
    if (id && !filePath.startsWith('plottr://')) {
      // update lastOpen, but wait a little so the file doesn't move from under their mouse
      setTimeout(() => {
        if (isOfflineFile(filePath)) {
          log.info('Opening offline file', filePath)
          return
        }
        knownFilesStore.set(`${id}.lastOpened`, Date.now())
        broadcastToAllWindows('reload-recents')
      }, 500)
    }
    openProjectWindow(filePath)
    if (unknown) addToKnown(filePath)
  }

  function listOfflineFiles() {
    return readdir(OFFLINE_FILE_FILES_PATH)
      .then((entries) => {
        return Promise.all(
          entries.map((entry) => {
            return lstat(path.join(OFFLINE_FILE_FILES_PATH, entry)).then((folder) => ({
              keep: folder.isFile(),
              payload: path.join(OFFLINE_FILE_FILES_PATH, entry),
            }))
          })
        ).then((results) => results.filter(({ keep }) => keep).map(({ payload }) => payload))
      })
      .catch((error) => {
        log.error(`Couldn't list the offline files directory: ${OFFLINE_FILE_FILES_PATH}`, error)
        return Promise.reject(error)
      })
  }

  function cleanOfflineBackups(knownFiles) {
    const expectedOfflineFiles = knownFiles
      .filter(({ isCloudFile, fileName }) => isCloudFile && fileName)
      .map(({ fileName }) => offlineFilePath(fileName))
    return listOfflineFiles().then((files) => {
      const filesToClean = files.filter((filePath) => expectedOfflineFiles.indexOf(filePath) === -1)
      return Promise.all(
        filesToClean.map((filePath) => {
          log.info(
            'Removing offline backup: "',
            filePath,
            '" because the online counterpart no longer exists'
          )
          return unlink(filePath)
        })
      )
    })
  }

  function saveOfflineFile(file) {
    // Don't save an offline version of an offline file
    if (!fs.existsSync(OFFLINE_FILE_FILES_PATH)) {
      fs.mkdirSync(OFFLINE_FILE_FILES_PATH, { recursive: true })
    }
    if (!file || !file.file || !file.file.fileName) {
      log.error('Trying to save a file but there is no file record on it.', file)
      return
    }
    const filePath = offlineFilePath(file.file.fileName)
    cleanOfflineBackups(file.knownFiles).then(() => {
      return saveFile(filePath, file)
    })
  }

  return {
    TMP_PATH,
    TEMP_FILES_PATH,
    listOfflineFiles,
    tempFilesStore,
    saveFile,
    autoSave,
    editKnownFilePath,
    removeFromTempFiles,
    removeFromKnownFiles,
    deleteKnownFile,
    createNew,
    createFromSnowflake,
    createFromScrivener,
    openKnownFile,
    saveOfflineFile,
  }
}

const {
  TMP_PATH,
  TEMP_FILES_PATH,
  listOfflineFiles,
  tempFilesStore,
  saveFile,
  autoSave,
  editKnownFilePath,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openKnownFile,
  saveOfflineFile,
} = makeFileModule()

export {
  TMP_PATH,
  TEMP_FILES_PATH,
  listOfflineFiles,
  tempFilesStore,
  saveFile,
  autoSave,
  editKnownFilePath,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openKnownFile,
  saveOfflineFile,
}
