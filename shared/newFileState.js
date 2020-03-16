const i18n = require('format-message')
const { series, book, chapter, ui, file, line, customAttributes, seriesLine } = require('./initialState')
const { app, remote } = require('electron')
let electronApp = app
if (remote) {
  electronApp = remote.app
}
i18n.setup({
  translations: require('../locales'),
  locale: electronApp.getLocale() || 'en'
})

// data structure

const newFileSeries = Object.assign(series, {name: i18n('My awesome story')})

const newFileBooks = {
  allIds: [1],
  1: book,
}

const newFileBeats = {
  allIds: [],
}

const newFileChapters = {
  allIds: [1],
  1: chapter,
}

const newFileUI = ui

const newFileFile = file

const newFileCharacters = []

const newFilePlaces = []

const newFileTags = []

const newFileCards = []

const newFileLines = [Object.assign(line, {title: i18n('Main Plot')})]
const newFileSeriesLines = [Object.assign(seriesLine, {title: i18n('Main Plot')})]

const newFileCustomAttributes = customAttributes

const newFileNotes = []
const newFileImages = {}

module.exports = {
  newFileSeries,
  newFileBooks,
  newFileBeats,
  newFileChapters,
  newFileUI,
  newFileFile,
  newFileCharacters,
  newFilePlaces,
  newFileTags,
  newFileCards,
  newFileLines,
  newFileSeriesLines,
  newFileCustomAttributes,
  newFileNotes,
  newFileImages,
}
