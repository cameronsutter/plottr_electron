const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const log = require('electron-log')
const { app } = require('electron')

const { t } = require('plottr_locales')

const { knownFilesStore, addToKnownFiles, addToKnown } = require('./known_files')
const { Importer } = require('./importer/snowflake/importer')
const { emptyFile, tree, SYSTEM_REDUCER_KEYS } = require('pltr/v2')
const { openProjectWindow } = require('./windows/projects')
const { shell } = require('electron')
const { broadcastToAllWindows } = require('./broadcast')
const { saveBackup } = require('./backup')

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

function saveFile(filePath, jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  if (process.env.NODE_ENV == 'development') {
    saveSwap(filePath, JSON.stringify(withoutSystemKeys, null, 2))
  } else {
    saveSwap(filePath, JSON.stringify(withoutSystemKeys))
  }
}

let itWorkedLastTime = true

function autoSave(event, filePath, file) {
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
  // either way, save a backup
  // TODO: move to main modules...
  saveBackup(filePath, file, (backupError) => {
    if (backupError) {
      event.sender.send('auto-save-backup-error', filePath, backupError)
    }
  })
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
  if (id) {
    // update lastOpen, but wait a little so the file doesn't move from under their mouse
    setTimeout(() => {
      knownFilesStore.set(`${id}.lastOpened`, Date.now())
      broadcastToAllWindows('reload-recents')
    }, 500)
  }
  openProjectWindow(filePath)
  if (unknown) addToKnown(filePath)
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
}
