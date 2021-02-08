import { cloneDeep } from 'lodash'
import { nextId } from '../../store/newIds'
import { line as defaultLine } from '../../store/initialState'

export default function migrate(data) {
  if (data.file && data.file.version === '2021.2.4') return data

  const obj = cloneDeep(data)
  const seriesLines = obj.seriesLines || []
  const oldIds = {}

  seriesLines.forEach((line) => {
    const newId = nextId(obj.lines)
    oldIds[line.id] = newId
    delete line.seriesLineId
    obj.lines.push({
      ...defaultLine,
      ...line,
      bookId: 'series',
      id: newId,
    })
  })

  const cards = obj.cards || []

  cards.forEach((card) => {
    if (card.seriesLineId) {
      card.lineId = oldIds[card.seriesLineId]
      delete card.seriesLineId
    }
  })

  delete obj.seriesLines

  return obj
}
