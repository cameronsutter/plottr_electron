const i18n = require('format-message')
const { series, book, chapter, beat, ui, file, line, customAttributes, seriesLine, categories } = require('./initialState')

// data structure

const newFileSeries = series

const newFileBooks = {
  allIds: [1],
  1: book,
}

const newFileBeats = [Object.assign({}, beat, {title: i18n('Beat 1')})]

const newFileChapters = [chapter]

const newFileUI = ui

const newFileFile = file

const newFileCharacters = []

const newFilePlaces = []

const newFileTags = []

const newFileCards = []

const newFileLines = [Object.assign({}, line, {title: i18n('Main Plot')})]
const newFileSeriesLines = [Object.assign({}, seriesLine, {title: i18n('Main Plot')})]

const newFileCustomAttributes = customAttributes

const newFileNotes = []
const newFileImages = {}

const newFileCharacterCategories = [
  {id: 1, name: i18n('Main'), position: 0},
  {id: 2, name: i18n('Supporting'), position: 1},
  {id: 3, name: i18n('Other'), position: 2},
]

const newFileCategories = Object.assign({}, categories, {characters: newFileCharacterCategories})

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
    file: Object.assign({}, newFileFile, {version}),
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

module.exports = emptyFile
