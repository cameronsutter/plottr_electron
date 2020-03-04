var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '1.3.0') return

  var obj = _.cloneDeep(data)

  // add templates & categoryId to characters
  obj.characters.forEach((c) => {
    c['templates'] = c['templates'] || []
    c.categoryId = ''
    c.tags = c.tags || []
  })

  // add templates to cards
  obj.cards.forEach((c) => {
    c['templates'] = c['templates'] || []
  })

  // add templates to places
  obj.places.forEach((pl) => {
    pl['templates'] = pl['templates'] || []
    pl.tags = pl.tags || []
  })

  // add templates to notes
  obj.notes.forEach((n) => {
    n['templates'] = n['templates'] || []
  })

  return obj
}

module.exports = migrate
