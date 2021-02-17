import { cloneDeep } from 'lodash'
import { beat as defaultBeat } from '../../store/initialState'
import { nextId } from '../../store/newIds'

export default function migrate(data) {
  if (data.file && data.file.version === '2021.2.8') return data

  const obj = cloneDeep(data)

  const beats = obj.beats || []
  obj.beats = beats
  beats.forEach((beat) => {
    if (beat.bookId) return
    beat.bookId = 'series'
  })

  const chapters = obj.chapters || []
  obj.chapters = chapters
  const oldIds = {}

  chapters.forEach((chapter) => {
    const newId = nextId(obj.beats)
    oldIds[chapter.id] = newId
    obj.beats.push({
      ...defaultBeat,
      ...chapter,
      id: newId,
    })
  })

  const cards = obj.cards || []
  obj.cards = cards

  cards.forEach((card) => {
    if (card.chapterId) {
      card.beatId = oldIds[card.chapterId]
      delete card.chapterId
    }
  })

  delete obj.chapters

  return obj
}
