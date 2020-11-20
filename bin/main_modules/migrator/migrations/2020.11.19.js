const { cloneDeep } = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '2020.11.19') return data

  let obj = cloneDeep(data)

  delete obj.ui.zoomIndex
  delete obj.ui.zoomState

  return obj
}

module.exports = migrate
