var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '0.6.0') return

  var obj = _.cloneDeep(data)

  // add version
  obj.file.version = '0.6.0'

  // add tag colors
  obj.tags.forEach((t) => {
    t['color'] = null
  })

  // remove userOptions
  delete obj.userOptions

  return obj
}

module.exports = migrate
