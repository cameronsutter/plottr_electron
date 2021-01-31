import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.8.28') return data

  let obj = cloneDeep(data)

  // add timelineTemplates to books
  obj.books.allIds.forEach((id) => (obj.books[id].timelineTemplates = []))

  // add fromTemplateId to cards
  obj.cards = data.cards.map((c) => {
    c.fromTemplateId = null
    return c
  })

  // add fromTemplateId to chapters
  obj.chapters = data.chapters.map((ch) => {
    ch.fromTemplateId = null
    return ch
  })

  // add fromTemplateId to lines
  obj.lines = data.lines.map((l) => {
    l.fromTemplateId = null
    return l
  })

  return obj
}
