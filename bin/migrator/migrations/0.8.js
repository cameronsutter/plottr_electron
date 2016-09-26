var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '0.8.0') return

  var obj = _.cloneDeep(data)

  // add notes to places
  obj.places.forEach((p) => {
    p['notes'] = p['notes'] || null
  })

  // add notes to characters
  obj.characters.forEach((c) => {
    c['notes'] = c['notes'] || null
  })


  return obj
}

module.exports = migrate
