import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.7.7') return data

  let obj = cloneDeep(data)

  // add expanded attribute to timeline
  obj.ui.timelineIsExpanded = true
  // add timelineFilter
  obj.ui.timelineFilter = null

  // add expanded attribute to lines
  obj.lines = obj.lines.map((l) => {
    l.expanded = null
    return l
  })

  // add expanded attribute to series lines
  obj.seriesLines = obj.seriesLines.map((l) => {
    l.expanded = null
    return l
  })

  // add autoOutlineSort to Chapters
  obj.chapters = obj.chapters.map((ch) => {
    ch.autoOutlineSort = true
    return ch
  })

  // add autoOutlineSort to Beats
  obj.beats = obj.beats.map((b) => {
    b.autoOutlineSort = true
    return b
  })

  // with cards
  // change position to positionWithinLine
  // add positionInChapter
  obj.cards = obj.cards.map((c) => {
    c.positionWithinLine = c.position
    c.positionInChapter = null
    return c
  })

  return obj
}
