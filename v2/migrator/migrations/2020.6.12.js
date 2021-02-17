import { cloneDeep } from 'lodash'
import { newFileCategories } from '../../store/newFileState'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.6.12') return data

  let obj = cloneDeep(data)

  // reset characters' categoryId to null instead of ''
  if (obj.characters) {
    obj.characters = obj.characters.map((ch) => {
      ch.categoryId = ch.categoryId || null
      return ch
    })
  }

  // add categories
  obj.categories = newFileCategories

  // reset character and place filters
  if (obj.ui) {
    obj.ui.characterFilter = null
    obj.ui.placeFilter = null
  }

  return obj
}
