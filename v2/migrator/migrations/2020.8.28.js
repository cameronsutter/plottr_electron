import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.8.28') return data

  let obj = cloneDeep(data)

  // add timelineTemplates to books
  if (obj.books) {
    if (obj.books.allIds) {
      obj.books.allIds.forEach((id) => (obj.books[id].timelineTemplates = []))
    }
  }

  // add fromTemplateId to cards
  if (obj.cards) {
    obj.cards = data.cards.map((c) => {
      c.fromTemplateId = null
      return c
    })
  }

  // add fromTemplateId to chapters
  if (obj.chapters) {
    obj.chapters = data.chapters.map((ch) => {
      ch.fromTemplateId = null
      return ch
    })
  }

  // add fromTemplateId to lines
  if (obj.lines) {
    obj.lines = data.lines.map((l) => {
      l.fromTemplateId = null
      return l
    })
  }

  return obj
}
