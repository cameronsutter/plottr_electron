import { cloneDeep } from 'lodash'
import { newFileBooks, newFileBeats, newFileSeriesLines } from '../../store/newFileState'
import { series } from '../../store/initialState'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.3.16') return data

  var obj = cloneDeep(data)

  const BOOK_ID = 1

  // +series
  // storyName -> series name
  // -storyName
  obj.series = series
  obj.series.name = obj.storyName
  delete obj.storyName

  // +books
  obj.books = newFileBooks
  obj.books[BOOK_ID].title = obj.series.name

  // everything in the current file is for book 1

  // +beats
  obj.beats = newFileBeats

  // scenes -> chapters (with new attrs)
  // -scenes
  obj.chapters = obj.scenes.map((sc) => {
    return {
      ...sc,
      bookId: BOOK_ID,
      time: 0,
      templates: [],
    }
  })
  delete obj.scenes

  // +character.bookIds (all = [1])
  obj.characters.forEach((ch) => {
    ch.bookIds = [BOOK_ID]
  })

  // +place.bookIds     (all = [1])
  obj.places.forEach((pl) => {
    pl.bookIds = [BOOK_ID]
  })

  // card.sceneId -> card.chapterId
  // +card.beatId
  // +card.bookId
  // +card.seriesLineId
  // +card.position
  // -card.sceneId
  obj.cards.forEach((c) => {
    c.chapterId = c.sceneId
    c.beatId = null
    c.bookId = null
    c.seriesLineId = null
    c.position = 0
    delete c.sceneId
  })

  // +line.characterId
  // +line.bookId
  obj.lines.forEach((l) => {
    l.characterId = null
    l.bookId = BOOK_ID
  })

  // +seriesLines
  obj.seriesLines = newFileSeriesLines

  // +note.bookIds
  obj.notes.forEach((n) => {
    n.bookIds = []
  })

  obj.ui.currentTimeline = BOOK_ID

  return obj
}
