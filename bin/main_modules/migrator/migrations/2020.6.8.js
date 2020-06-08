const _ = require('lodash')
const { newFileCategories } = require('../../../../shared/newFileState')

function migrate (data) {
  if (data.file && data.file.version === '2020.6.8') return data

  var obj = _.cloneDeep(data)

  obj.characters = obj.characters.map(ch => {
    ch.categoryId = ch.categoryId || null
    return ch
  })

  obj.categories = newFileCategories

  return obj
}

module.exports = migrate