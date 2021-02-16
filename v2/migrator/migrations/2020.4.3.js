import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.4.3') return data

  var obj = cloneDeep(data)

  // data structure going from ['name:#:type'] to [{name: 'name', type: 'type'}]
  if (obj.customAttributes) {
    if (obj.customAttributes.characters) {
      obj.customAttributes.characters = obj.customAttributes.characters.map((val) => {
        const [name, typeVal] = val.split(':#:')
        const type = typeVal || 'text'

        return { name, type }
      })
    }

    if (obj.customAttributes.places) {
      // data structure going from ['name'] to [{name: 'name', type: 'text'}]
      obj.customAttributes.places = obj.customAttributes.places.map((name) => {
        return { name, type: 'text' }
      })
    }
  }

  // reset character & place filters
  if (obj.ui) {
    obj.ui.characterFilter = null
    obj.ui.placeFilter = null
  }

  return obj
}
