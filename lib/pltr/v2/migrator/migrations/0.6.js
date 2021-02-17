import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '0.6.0') return data

  var obj = cloneDeep(data)

  // add version
  obj.file.version = '0.6.0'

  // add tag colors
  if (obj.tags) {
    obj.tags.forEach((t) => {
      t['color'] = t['color'] || null
    })
  }

  // add colors to places
  if (obj.places) {
    obj.places.forEach((p) => {
      p['color'] = p['color'] || null
    })
  }

  // add colors to characters
  if (obj.characters) {
    obj.characters.forEach((c) => {
      c['color'] = c['color'] || null
    })
  }

  // remove chapters
  delete obj.chapters

  // remove userOptions
  delete obj.userOptions

  return obj
}
