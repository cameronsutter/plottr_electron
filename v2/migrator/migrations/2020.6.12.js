const { cloneDeep } = require('lodash')

const newFileCategories = [
  {id: 1, name: 'Main', position: 0},
  {id: 2, name: 'Supporting', position: 1},
  {id: 3, name: 'Other', position: 2},
]

function migrate (data) {
  if (data.file && data.file.version === '2020.6.12') return data

  let obj = cloneDeep(data)

  // reset characters' categoryId to null instead of ''
  obj.characters = obj.characters.map(ch => {
    ch.categoryId = ch.categoryId || null
    return ch
  })

  // add categories
  obj.categories = newFileCategories

  // reset character and place filters
  obj.ui.characterFilter = null
  obj.ui.placeFilter = null

  return obj
}

module.exports = migrate
