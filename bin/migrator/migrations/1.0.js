var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '1.0.0') return

  var obj = _.cloneDeep(data)

  obj['notes'] = []

  // add notes to characters
  obj.characters.forEach((c) => {
    c['noteIds'] = c['noteIds'] || []
  })

  // add notes to places
  obj.places.forEach((c) => {
    c['noteIds'] = c['noteIds'] || []
  })

  return obj
}

module.exports = migrate
