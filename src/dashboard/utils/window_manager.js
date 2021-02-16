import path from 'path'
import { remote, ipcRenderer } from 'electron'
import t from 'format-message'
import { knownFilesStore } from '../../common/utils/store_hooks'
import { saveToTempFile } from '../../common/utils/temp_files'
import { addToKnownFiles } from '../../common/utils/known_files'
import Importer from '../../common/importer/snowflake/importer'
import { emptyFile, migrateIfNeeded } from 'pltr/v2'
const win = remote.getCurrentWindow()
const { dialog, app } = remote

export function openKnownFile(filePath, id) {
  if (id) {
    // update lastOpen, but wait a little so the file doesn't move from under their mouse
    setTimeout(() => {
      knownFilesStore.set(`${id}.lastOpened`, Date.now())
    }, 500)
  }
  ipcRenderer.send('pls-open-window', filePath, false)
}

export function openExistingFile() {
  // ask user where it is
  const properties = ['openFile', 'createDirectory']
  const filters = [{ name: t('Plottr project file'), extensions: ['pltr'] }]
  console.log('OPEN EXISTING')
  const files = dialog.showOpenDialogSync(win, { filters: filters, properties: properties })
  if (files && files.length) {
    const id = addToKnownFiles(files[0])
    openKnownFile(files[0], id)
  }
}

export function createNew(templateData) {
  const emptyPlottrFile = emptyFile(t('Untitled'), app.getVersion())
  if (!templateData) {
    const filePath = saveToTempFile(emptyPlottrFile)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
    return
  }
  const tempTemplateFilePath = saveToTempFile({
    ...templateData,
    file: {
      version: templateData.version,
    },
  })
  migrateIfNeeded(
    app.getVersion(),
    {
      ...templateData,
      file: {
        version: templateData.version,
      },
    },
    tempTemplateFilePath,
    null,
    (error, didMigrate, state) => {
      if (error) {
        // Let the top level handler handle it
        throw error
      }
      const mergedWithEmptyFile = Object.assign({}, emptyPlottrFile, state)
      const filePath = saveToTempFile(mergedWithEmptyFile)
      const fileId = addToKnownFiles(filePath)
      openKnownFile(filePath, fileId)
    }
  )
}

export function createFromSnowflake(importedPath) {
  const storyName = path.basename(importedPath, '.snowXML')
  let json = emptyFile(storyName, app.getVersion())
  // clear beats and lines
  json.beats = []
  json.lines = []
  const importedJson = Importer(importedPath, true, json)

  const filePath = saveToTempFile(importedJson)
  const fileId = addToKnownFiles(filePath)
  openKnownFile(filePath, fileId)
}
