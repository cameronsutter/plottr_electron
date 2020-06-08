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
    series: name ? Object.assign({}, newFileSeries, {name: name}) : newFileSeries,
    books: books,
    beats: newFileBeats,
    chapters: newFileChapters,
    ui: newFileUI,
    file: Object.assign({}, newFileFile, {version: app.getVersion()}),
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