import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '0.9.0') return data

  var obj = cloneDeep(data)

  // add custom attributes
  obj['customAttributes'] = {
    characters: [],
    places: [],
    cards: [],
    scenes: [],
    lines: [],
  }

  // add scenes (via cards) to characters
  obj.characters.forEach((ch) => {
    ch['cards'] = ch['cards'] || []
  })

  // add scenes (via cards) to places
  obj.places.forEach((p) => {
    p['cards'] = p['cards'] || []
  })

  // for some reason, some cards end up without these
  // so this is just to ensure all cards do
  obj.cards.forEach((c) => {
    c['characters'] = c['characters'] || []
    c['places'] = c['places'] || []
    c['tags'] = c['tags'] || []
  })

  // add the default orientation
  obj['ui']['orientation'] = 'horizontal'

  return obj
}
