var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '2020.4.3') return data

  var obj = _.cloneDeep(data)

  // data structure going from ['name:#:type'] to [{name: 'name', type: 'type'}]
  obj.customAttributes.characters = obj.customAttributes.characters.map(val => {
    const [name, typeVal] = val.split(':#:')
    const type = typeVal || 'text'

    return {name, type}
  })

  // data structure going from ['name'] to [{name: 'name', type: 'text'}]
  obj.customAttributes.places = obj.customAttributes.places.map(name => {
    return {name, type: 'text'}
  })

  // remove anything in the character filter that was a paragraph type before … doesn't belong there
  obj.ui.characterFilter = Object.keys(obj.ui.characterFilter)
    .filter(attrStr => !attrStr.includes(':#:paragraph'))
    .reduce((acc, attrStr) => {
      acc[attrStr] = obj.ui.characterFilter[attrStr]
      return acc
    }, {})

  return obj
}

module.exports = migrate
