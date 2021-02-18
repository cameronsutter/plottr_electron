import { t as i18n } from 'plottr_locales'
import {
  series,
  book,
  chapter,
  beat,
  ui,
  file,
  line,
  customAttributes,
  seriesLine,
  categories,
  seriesTimeline,
  bookTimeline,
} from './initialState'

// data structure

export const newFileSeries = series

export const newFileBooks = {
  allIds: [1],
  1: book,
}

export const newFileBeats = [beat]

export const newFileChapters = [{ ...chapter, id: 2 }]

export const newFileUI = ui

export const newFileFile = file

export const newFileCharacters = []

export const newFilePlaces = []

export const newFileTags = []

export const newFileCards = []

export const newFileLines = [Object.assign({}, line, { title: i18n('Main Plot') })]
export const newFileSeriesLines = [Object.assign({}, seriesLine, { title: i18n('Main Plot') })]

export const newFileCustomAttributes = customAttributes

export const newFileNotes = []
export const newFileImages = {}

export const newFileCharacterCategories = [
  { id: 1, name: i18n('Main'), position: 0 },
  { id: 2, name: i18n('Supporting'), position: 1 },
  { id: 3, name: i18n('Other'), position: 2 },
]

export const newFileCategories = Object.assign({}, categories, {
  characters: newFileCharacterCategories,
})

export const newFileSeriesTimeline = seriesTimeline

export const newFileTimeline = bookTimeline

export const newFileTimelines = {
  [newFileSeriesTimeline.bookId]: newFileSeriesTimeline,
  [newFileTimeline.bookId]: newFileTimeline,
}

export function emptyFile(name, version) {
  const books = {
    ...newFileBooks,
    [1]: {
      ...newFileBooks[1],
      title: name,
    },
  }
  return {
    ui: newFileUI,
    file: Object.assign({}, newFileFile, { version }),
    series: name ? Object.assign({}, newFileSeries, { name: name }) : newFileSeries,
    books: books,
    characters: newFileCharacters,
    cards: newFileCards,
    lines: [...newFileLines, ...newFileSeriesLines],
    customAttributes: newFileCustomAttributes,
    places: newFilePlaces,
    tags: newFileTags,
    notes: newFileNotes,
    beats: [...newFileBeats, ...newFileChapters],
    categories: newFileCategories,
    images: newFileImages,
    timelines: newFileTimelines,
  }
}
