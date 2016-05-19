var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '0.7.0') return

  var obj = _.cloneDeep(data)

  // remove chapters ... yes again
  delete obj.chapters

  return obj
}

module.exports = migrate
