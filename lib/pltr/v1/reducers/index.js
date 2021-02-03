import { combineReducers } from 'redux'
import ui from './ui'
import file from './file'
import storyName from './storyName'
import places from './places'
import tags from './tags'
import characters from './characters'
import scenes from './scenes'
import cards from './cards'
import lines from './lines'
import customAttributes from './customAttributes'
import notes from './notes'

const rootReducer = combineReducers({
  ui,
  file,
  storyName,
  places,
  tags,
  characters,
  scenes,
  cards,
  lines,
  customAttributes,
  notes,
})

export default rootReducer
