var _ = require('lodash')
const { newFileBooks, newFileBeats, newFileSeriesLines } = require('../../../shared/newFileState')
const { series } = require('../../../shared/initialState')

function migrate (data) {
  if (data.file && data.file.version === '2020.3.16') return data

  var obj = _.cloneDeep(data)

  // +series
  obj.series = series
  // storyName -> series name
  obj.series.name = obj.storyName
  // -storyName
  delete obj.storyName

  // +books
  obj.books = newFileBooks
  obj.books[1].name = obj.series.name

  // everything in the current file is for book 1

  // +beats
  obj.beats = newFileBeats

  // scenes -> chapters (with new attrs)
  const sortedScenes = _.sortBy(obj.scenes, 'position')
  obj.chapters = sortedScenes.reduce((acc, sc) => {
    acc.allIds.push(sc.id)
    acc[sc.id] = {
      ...sc,
      bookId: 1,
      time: 0,
      templates: [],
    }
    return acc
  }, {allIds: []})
  // -scenes
  delete obj.scenes

  // +character.bookIds (all = [1])
  obj.characters.forEach(ch => {
    ch.bookIds = [1]
  })

  // +place.bookIds     (all = [1])
  obj.places.forEach(pl => {
    pl.bookIds = [1]
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
    l.bookId = 1
  })

  // +seriesLines
  obj.seriesLines = newFileSeriesLines

  // +note.bookIds
  obj.notes.forEach(n => {
    n.bookIds = []
  })

  return obj
}

module.exports = migrate
