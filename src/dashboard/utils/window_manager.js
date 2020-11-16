import fs from 'fs'
import path from 'path'
import { remote, ipcRenderer } from 'electron'
import { knownFilesStore, tempFilesStore } from '../../common/utils/store_hooks'
import { TEMP_FILES_PATH } from '../../common/utils/config_paths'
// const { newFileState } = require('pltr/v2')
// import pltr from 'pltr/v2'
// const pltr = require('pltr')

// TODO: pull this from pltr
const {
  newFileSeries, newFileBooks, newFileBeats, newFileChapters, newFileUI, newFileFile,
  newFileCharacters, newFilePlaces, newFileTags, newFileCards, newFileLines,
  newFileSeriesLines, newFileCustomAttributes, newFileNotes, newFileImages, newFileCategories,
} = require('../../../shared/newFileState')
import t from 'format-message'
const win = remote.getCurrentWindow()
const dialog = remote.dialog
const app = remote.app

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
  const filters = [{name: 'Plottr file', extensions: ['pltr']}]
  const files = dialog.showOpenDialogSync(win, { filters: filters, properties: properties })
  if (files && files.length) {
    const id = addToKnown(files[0])
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
    const fileId = addToKnown(filePath)
    openKnownFile(filePath, fileId)
  } catch (error) {
    throw error
  }
}

function addToKnown (filePath) {
  const existingId = Object.keys(knownFilesStore.store).find(id => knownFilesStore.store[id].path == filePath)
  if (existingId) {
    return existingId
  } else {
    const newId = knownFilesStore.size + 1
    knownFilesStore.set(`${newId}`, {
      path: filePath,
      lastOpened: Date.now()
    })
    return newId
  }
}

function saveToTempFile (json) {
  const tempId = tempFilesStore.size + 1
  const tempName = `${t('Untitled')}${tempId == 1 ? '' : tempId}.pltr`
  const filePath = path.join(TEMP_FILES_PATH, tempName)
  tempFilesStore.set(`${tempId}`, {filePath})
  saveFile(filePath, json)
  return filePath
}

function saveFile (filePath, jsonData) {
  let stringData = ''
  if (process.env.NODE_ENV == 'development') {
    stringData = JSON.stringify(jsonData, null, 2)
  } else {
    stringData = JSON.stringify(jsonData)
  }
  fs.writeFileSync(filePath, stringData)
}

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