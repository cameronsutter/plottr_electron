var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '0.9.0') return

  var obj = _.cloneDeep(data)

  // add custom attributes
  obj['customAttributes'] = {
    characters: [],
    places: [],
    cards: [],
    scenes: [],
    lines: []
  }

  // add scenes (via cards) to characters
  obj.characters.forEach((c) => {
    c['cards'] = c['cards'] || []
  })

  // add the default orientation
  obj['ui']['orientation'] = 'horizontal'


  return obj
}

module.exports = migrate
