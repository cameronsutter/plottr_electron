import { combineReducers } from 'redux'
import ui from './ui'
import userOptions from './userOptions'
import file from './file'
import storyName from './storyName'
import chapters from './chapters'
import places from './places'
import tags from './tags'
import characters from './characters'
import scenes from './scenes'
import cards from './cards'
import lines from './lines'

const rootReducer = combineReducers({
  ui,
  userOptions,
  file,
  storyName,
  chapters,
  places,
  tags,
  characters,
  scenes,
  cards,
  lines
})

export default rootReducer
