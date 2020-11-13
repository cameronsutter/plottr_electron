import i18n from 'format-message'
import { series, book, chapter, beat, ui, file, line, customAttributes, seriesLine, categories } from './initialState'

// data structure

export const newFileSeries = series

export const newFileBooks = {
  allIds: [1],
  1: book,
}

export const newFileBeats = [Object.assign({}, beat, {title: i18n('Beat 1')})]

export const newFileChapters = [chapter]

export const newFileUI = ui

export const newFileFile = file

export const newFileCharacters = []

export const newFilePlaces = []

export const newFileTags = []

export const newFileCards = []

export const newFileLines = [Object.assign({}, line, {title: i18n('Main Plot')})]
export const newFileSeriesLines = [Object.assign({}, seriesLine, {title: i18n('Main Plot')})]

export const newFileCustomAttributes = customAttributes

export const newFileNotes = []
export const newFileImages = {}

export const newFileCharacterCategories = [
  {id: 1, name: i18n('Main'), position: 0},
  {id: 2, name: i18n('Supporting'), position: 1},
  {id: 3, name: i18n('Other'), position: 2},
]

export const newFileCategories = Object.assign({}, categories, {characters: newFileCharacterCategories})

export function emptyFile (name, version) {
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
