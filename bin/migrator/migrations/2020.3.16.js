var _ = require('lodash')
const { newFileBooks, newFileBeats, newFileSeriesLines } = require('../../../shared/newFileState')
const { series } = require('../../../shared/initialState')

function migrate (data) {
  if (data.file && data.file.version === '2020.3.16') return data

  var obj = _.cloneDeep(data)

  const BOOK_ID = 1

  // +series
  obj.series = series
  // storyName -> series name
  obj.series.name = obj.storyName
  // -storyName
  delete obj.storyName

  // +books
  obj.books = newFileBooks
  obj.books[BOOK_ID].name = obj.series.name

  // everything in the current file is for book 1

  // +beats
  obj.beats = newFileBeats

  // scenes -> chapters (with new attrs)
  const sortedScenes = _.sortBy(obj.scenes, 'position')
  obj.chapters = sortedScenes.reduce((acc, sc) => {
    acc.allIds.push(sc.id)
    acc[sc.id] = {
      ...sc,
      bookId: BOOK_ID,
      time: 0,
      templates: [],
    }
    delete acc[sc.id].position
    return acc
  }, {allIds: []})
  // -scenes
  delete obj.scenes

  // +character.bookIds (all = [1])
  obj.characters.forEach(ch => {
    ch.bookIds = [BOOK_ID]
  })

  // +place.bookIds     (all = [1])
  obj.places.forEach(pl => {
    pl.bookIds = [BOOK_ID]
  })

  // card.sceneId -> card.chapterId
  obj.cards.forEach(c => {
    c.chapterId = c.sceneId
    // +card.beatId
    c.beatId = null
    // +card.bookId
    c.bookId = null
    // +card.seriesLineId
    c.seriesLineId = null
    // -card.sceneId
    delete c.sceneId
  })

  obj.lines.forEach(l => {
    // +line.characterId
    l.characterId = null
    // +line.bookId
    l.bookId = BOOK_ID
  })

  // +seriesLines
  obj.seriesLines = newFileSeriesLines

  // +note.bookIds
  obj.notes.forEach(n => {
    n.bookIds = []
  })

  obj.ui.currentTimeline = BOOK_ID

  return obj
}

module.exports = migrate
