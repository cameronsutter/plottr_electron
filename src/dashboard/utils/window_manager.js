import path from 'path'
import { remote, ipcRenderer } from 'electron'
import t from 'format-message'
import { knownFilesStore } from '../../common/utils/store_hooks'
import { saveToTempFile } from '../../common/utils/temp_files'
import { addToKnownFiles } from '../../common/utils/known_files'
import Importer from '../../common/importer/snowflake/importer'
// const { newFileState } = require('pltr/v2')
// import pltr from 'pltr/v2'
// const pltr = require('pltr')

// TODO: pull this from pltr
const {
  newFileSeries, newFileBooks, newFileBeats, newFileChapters, newFileUI, newFileFile,
  newFileCharacters, newFilePlaces, newFileTags, newFileCards, newFileLines,
  newFileSeriesLines, newFileCustomAttributes, newFileNotes, newFileImages, newFileCategories,
} = require('../../../shared/newFileState')
const win = remote.getCurrentWindow()
const { dialog, app } = remote

export function openKnownFile (filePath, id) {
  if (id) {
    // update lastOpen
    knownFilesStore.set(`${id}.lastOpened`, Date.now())
  }
  ipcRenderer.send('pls-open-window', filePath)
}

export function openExistingFile () {
  // ask user where it is
  const properties = [ 'openFile', 'createDirectory' ]
  const filters = [{name: t('Plottr project file'), extensions: ['pltr']}]
  const files = dialog.showOpenDialogSync(win, { filters: filters, properties: properties })
  if (files && files.length) {
    const id = addToKnownFiles(files[0])
    openKnownFile(files[0], id)
  }
}

export function createNew (templateData) {
  // let json = newFileState(t('Untitled'), app.getVersion())
  let json = emptyFile(t('Untitled'), app.getVersion())

  if (templateData) {
    json = Object.assign({}, json, templateData)
  }
  try {
    const filePath = saveToTempFile(json)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
  } catch (error) {
    throw error
  }
}

export function createFromSnowflake (importedPath) {
  const storyName = path.basename(importedPath, '.snowXML')
  // let json = newFileState(storyName, app.getVersion())
  let json = emptyFile(storyName, app.getVersion())
  // clear chapters and lines
  json.chapters = []
  json.lines = []
  const importedJson = Importer(importedPath, true, json)

  try {
    const filePath = saveToTempFile(importedJson)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
  } catch (error) {
    throw error
  }
}

// TODO: refactor this
function emptyFile (name, version) {
  const books = {
    ...newFileBooks,
    [1]: {
      ...newFileBooks[1],
      title: name,
    }
  }
  return {
    series: name ? Object.assign({}, newFileSeries, {name: name}) : newFileSeries,
    books: books,
    beats: newFileBeats,
    chapters: newFileChapters,
    ui: newFileUI,
    file: Object.assign({}, newFileFile, {version: version}),
    characters: newFileCharacters,
    places: newFilePlaces,
    tags: newFileTags,
    cards: newFileCards,
    lines: newFileLines,
    seriesLines: newFileSeriesLines,
    customAttributes: newFileCustomAttributes,
    notes: newFileNotes,
    images: newFileImages,
    categories: newFileCategories,
  }
}