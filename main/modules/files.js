const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const log = require('electron-log')
const { app } = require('electron')

const { t } = require('plottr_locales')

const { knownFilesStore, addToKnownFiles, addToKnown } = require('./known_files')
const { Importer } = require('./importer/snowflake/importer')
const { selectors, emptyFile, tree, SYSTEM_REDUCER_KEYS } = require('pltr/v2')
const { openProjectWindow } = require('./windows/projects')
const { shell } = require('electron')
const { broadcastToAllWindows } = require('./broadcast')
const { saveBackup } = require('./backup')
const SETTINGS = require('./settings')
const { OFFLINE_FILE_FILES_PATH, offlineFilePath } = require('./offlineFilePath')

const TMP_PATH = 'tmp'
const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH
const tempFilesStore = new Store({ name: tempPath, cwd: 'tmp', watch: true })

function saveSwap(filePath, data) {
  const swapFilePath = filePath + '~'
  fs.writeFileSync(swapFilePath, data)
  const MAX_ATTEMPTS = 10
  let counter = 0
  while (counter < MAX_ATTEMPTS) {
    const stats = fs.statSync(swapFilePath, { throwIfNoEntry: false })
    if (stats && stats.size !== 0) {
      fs.renameSync(swapFilePath, filePath)
      return
    }
    ++counter
  }
  console.error(Error(`Failed to save to ${filePath}.  Old file is un-touched.`))
}

function removeSystemKeys(jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  return withoutSystemKeys
}

function saveFile(inputFilePath, jsonData) {
  const isOffline = selectors.isOfflineSelector(jsonData)
  const filePath = isOffline ? offlineFilePath(inputFilePath) : inputFilePath
  const withoutSystemKeys = removeSystemKeys(jsonData)
  if (process.env.NODE_ENV == 'development') {
    saveSwap(filePath, JSON.stringify(withoutSystemKeys, null, 2))
  } else {
    saveSwap(filePath, JSON.stringify(withoutSystemKeys))
  }
}

let itWorkedLastTime = true

let backupTimeout = null
let resetCount = 0
const MAX_ATTEMPTS = 200

function autoSave(event, filePath, file, userId, previousFile) {
  // Don't auto save while resolving resuming the connection
  if (selectors.isResumingSelector(file)) return

  const onCloud = selectors.isCloudFileSelector(file)
  const isOffline = selectors.isOfflineSelector(file)

  if (!onCloud || isOffline) {
    try {
      saveFile(filePath, file)
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
      saveBackup(filePath, previousFile || file, (backupError) => {
        if (backupError) {
          event.sender.send('auto-save-backup-error', filePath, backupError)
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

function removeFromTempFiles(filePath, doDelete = true) {
  const tmpFiles = tempFilesStore.get()
  const key = Object.keys(tmpFiles).find((id) => tmpFiles[id].filePath == filePath)
  tempFilesStore.delete(key)
  // delete the real file
  try {
    if (doDelete) shell.moveItemToTrash(filePath, true)
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
    shell.moveItemToTrash(filePath, true)
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

function saveToTempFile(json) {
  const tempId = tempFilesStore.size + 1
  const tempName = `${t('Untitled')}${tempId == 1 ? '' : tempId}.pltr`
  const filePath = path.join(TEMP_FILES_PATH, tempName)
  tempFilesStore.set(`${tempId}`, { filePath })
  saveFile(filePath, json)
  return filePath
}

function createNew(template) {
  if (template) {
    const filePath = saveToTempFile(template)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
  } else {
    const emptyPlottrFile = emptyFile(t('Untitled'), app.getVersion())
    const filePath = saveToTempFile(emptyPlottrFile)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
  }
}

function createFromSnowflake(importedPath) {
  const storyName = path.basename(importedPath, '.snowXML')
  let json = emptyFile(storyName, app.getVersion())
  // clear beats and lines
  json.beats = {
    series: tree.newTree('id'),
  }
  json.lines = []
  const importedJson = Importer(importedPath, true, json)

  const filePath = saveToTempFile(importedJson)
  const fileId = addToKnownFiles(filePath)
  openKnownFile(filePath, fileId)
}

function openKnownFile(filePath, id, unknown) {
  if (id && !filePath.startsWith('plottr://')) {
    // update lastOpen, but wait a little so the file doesn't move from under their mouse
    setTimeout(() => {
      knownFilesStore.set(`${id}.lastOpened`, Date.now())
      broadcastToAllWindows('reload-recents')
    }, 500)
  }
  openProjectWindow(filePath)
  if (unknown) addToKnown(filePath)
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
  const withoutSystemKeys = removeSystemKeys(file)
  if (process.env.NODE_ENV == 'development') {
    saveSwap(filePath, JSON.stringify(withoutSystemKeys, null, 2))
  } else {
    saveSwap(filePath, JSON.stringify(withoutSystemKeys))
  }
}

module.exports = {
  TMP_PATH,
  TEMP_FILES_PATH,
  tempFilesStore,
  saveFile,
  autoSave,
  editKnownFilePath,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  saveToTempFile,
  createNew,
  createFromSnowflake,
  openKnownFile,
  saveOfflineFile,
}
