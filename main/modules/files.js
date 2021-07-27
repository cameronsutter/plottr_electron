const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const { app } = require('electron')
const log = require('electron-log')

const { t } = require('plottr_locales')

const { knownFilesStore, addToKnownFiles, addToKnown } = require('./known_files')
const { Importer } = require('./importer/snowflake/importer')
const { emptyFile, tree } = require('pltr/v2')
const { openProjectWindow } = require('./windows/projects')
const { shell } = require('electron')
const { broadcastToAllWindows } = require('./broadcast')

const TMP_PATH = 'tmp'
const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH
const tempFilesStore = new Store({ name: tempPath, cwd: 'tmp', watch: true })

function saveFile(filePath, jsonData) {
  let stringData = ''
  if (process.env.NODE_ENV == 'development') {
    stringData = JSON.stringify(jsonData, null, 2)
  } else {
    stringData = JSON.stringify(jsonData)
  }
  fs.writeFileSync(filePath, stringData)
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
  removeFromTempFiles,
  saveToTempFile,
  createNew,
  createFromSnowflake,
  openKnownFile,
}
