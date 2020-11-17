const { cloneDeep } = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '2020.11.16') return data

  let obj = cloneDeep(data)

  obj.ui.timelineScrollPosition = {
    x: 0,
    y: 0,
  }

  return obj
}

module.exports = migrate
