const { cloneDeep } = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '2020.7.7') return data

  let obj = cloneDeep(data)

  // add expanded attribute to timeline
  obj.ui.timelineIsExpanded = true

  // add expanded attribute to lines
  obj.lines = obj.lines.map(l => {
    l.expanded = null
    return l
  })

  // add expanded attribute to series lines
  obj.seriesLines = obj.seriesLines.map(l => {
    l.expanded = null
    return l
  })

  return obj
}

module.exports = migrate