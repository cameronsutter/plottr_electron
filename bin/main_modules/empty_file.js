const { app } = require('electron')
const {
  newFileSeries, newFileBooks, newFileBeats, newFileChapters, newFileUI, newFileFile,
  newFileCharacters, newFilePlaces, newFileTags, newFileCards, newFileLines,
  newFileSeriesLines, newFileCustomAttributes, newFileNotes, newFileImages, newFileCategories,
} = require('../../shared/newFileState')

function emptyFile (name) {
  const books = {
    ...newFileBooks,
    [1]: {
      ...newFileBooks[1],
      title: name,
    }
  }
  return {
    ui: newFileUI,
    file: Object.assign({}, newFileFile, {version: app.getVersion()}),
    series: name ? Object.assign({}, newFileSeries, {name: name}) : newFileSeries,
    books: books,
    characters: newFileCharacters,
    chapters: newFileChapters,
    cards: newFileCards,
    lines: newFileLines,
    customAttributes: newFileCustomAttributes,
    places: newFilePlaces,
    tags: newFileTags,
    notes: newFileNotes,
    beats: newFileBeats,
    seriesLines: newFileSeriesLines,
    categories: newFileCategories,
    images: newFileImages,
  }
}

module.exports = emptyFile