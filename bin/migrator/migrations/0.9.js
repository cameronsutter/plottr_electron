var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '0.9.0') return

  var obj = _.cloneDeep(data)

  // add custom character attributes
  obj['customAttributes'] = {
    characters: [],
    places: [],
    cards: [],
    scenes: [],
    lines: []
  }


  return obj
}

module.exports = migrate
