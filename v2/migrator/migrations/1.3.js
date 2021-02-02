import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '1.3.0') return data

  var obj = cloneDeep(data)

  // characterSort
  obj.ui.characterSort = 'name~asc'
  // characterFilter
  obj.ui.characterFilter = null
  // placeSort
  obj.ui.placeSort = 'name~asc'
  // placeFilter
  obj.ui.placeFilter = null
  // noteSort
  obj.ui.noteSort = 'title'
  // noteFilter
  obj.ui.noteFilter = null

  return obj
}
