import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '0.8.0') return data

  var obj = cloneDeep(data)

  // add notes to places
  if (obj.places) {
    obj.places.forEach((p) => {
      p['notes'] = p['notes'] || ''
    })
  }

  // add notes to characters
  if (obj.characters) {
    obj.characters.forEach((c) => {
      c['notes'] = c['notes'] || ''
    })
  }

  return obj
}
