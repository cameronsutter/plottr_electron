import _ from 'lodash'
const { remote } = require('electron')
const app = remote.app
import { ui, scene, character, place,
  tag, card, line, note } from '../../../shared/initialState'

export default function FileFixer (state) {
  var newState = _.cloneDeep(state)

  // reset view
  newState.ui = ui

  // check structure
  newState.scenes = newState.scenes.map(s => attrFixer(s, scene))
  newState.characters = newState.characters.map(c => attrFixer(c, character))
  newState.places = newState.places.map(p => attrFixer(p, place))
  newState.tags = newState.tags.map(t => attrFixer(t, tag, false))
  newState.cards = newState.cards.map(c => attrFixer(c, card))
  newState.lines = newState.lines.map(l => attrFixer(l, line))
  newState.notes = newState.notes.map(n => attrFixer(n, note))

  // check associations
  let ch = 'characters'
  let pl = 'places'
  let ta = 'tags'
  let ca = 'cards'
  let no = 'noteIds'
  newState.cards.forEach(c => {
    c[ch] = fixAssociation(c[ch], newState[ch])
    c[pl] = fixAssociation(c[pl], newState[pl])
    c[ta] = fixAssociation(c[ta], newState[ta])
  })
  newState.notes.forEach(n => {
    n[ch] = fixAssociation(n[ch], newState[ch])
    n[pl] = fixAssociation(n[pl], newState[pl])
    n[ta] = fixAssociation(n[ta], newState[ta])
  })
  newState.characters.forEach(c => {
    c[ca] = fixAssociation(c[ca], newState[ca])
    c[no] = fixAssociation(c[no], newState.notes)
  })
  newState.places.forEach(p => {
    p[ca] = fixAssociation(p[ca], newState[ca])
    p[no] = fixAssociation(p[no], newState.notes)
  })

  newState.file.version = app.getVersion()

  return newState
}

function attrFixer (item, template, useColor = true) {
  Object.keys(template).forEach(attr => {
    if (!item[attr]) item[attr] = template[attr]
    if (attr == 'color' && useColor) {
      if (typeof item[attr] !== typeof template[attr]) item[attr] = template[attr]
    }
  })
  return item
}

function fixAssociation (list, associatedItems) {
  return list.filter(item =>
    _.some(associatedItems, {id: item})
  )
}
