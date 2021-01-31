const { cloneDeep } = require('lodash')

function migrate(data) {
  if (data.file && data.file.version === '2021.1.15') return data

  let obj = cloneDeep(data)

  delete obj.ui.zoomIndex
  delete obj.ui.zoomState

  obj.ui.timeline = { size: 'large' }

  return obj
}

module.exports = migrate
