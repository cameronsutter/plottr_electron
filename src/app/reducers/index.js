import { combineReducers } from 'redux'
import ui from './ui'
import file from './file'
import places from './places'
import tags from './tags'
import characters from './characters'
import chapters from './chapters'
import cards from './cards'
import lines from './lines'
import customAttributes from './customAttributes'
import notes from './notes'
import images from './images'
import beats from './beats'
import books from './books'
import series from './series'
import seriesLines from './seriesLines'

const rootReducer = combineReducers({
  ui,
  file,
  places,
  tags,
  characters,
  chapters,
  cards,
  lines,
  customAttributes,
  notes,
  images,
  beats,
  books,
  series,
  seriesLines,
})

export default rootReducer
