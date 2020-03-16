const { app } = require('electron')
const {
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
} = require('../../shared/newFileState')

function emptyFile (name) {
  return {
    series: name ? Object.assign(newFileSeries, {name: name}) : newFileSeries,
    books: newFileBooks,
    beats: newFileBeats,
    chapters: newFileChapters,
    ui: newFileUI,
    file: Object.assign(newFileFile, {version: app.getVersion()}),
    characters: newFileCharacters,
    places: newFilePlaces,
    tags: newFileTags,
    cards: newFileCards,
    lines: newFileLines,
    seriesLines: newFileSeriesLines,
    customAttributes: newFileCustomAttributes,
    notes: newFileNotes,
    images: newFileImages,
  }
}

module.exports = emptyFile