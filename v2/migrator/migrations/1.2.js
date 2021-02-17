import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '1.2.0') return data

  var obj = cloneDeep(data)

  // add dark mode
  if (obj.ui) {
    obj.ui.darkMode = false
  }

  return obj
}
