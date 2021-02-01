import { combineReducers } from 'redux'
import beats from './beats'
import books from './books'
import cards from './cards'
import categories from './categories'
import chapters from './chapters'
import characters from './characters'
import customAttributes from './customAttributes'
import file from './file'
import images from './images'
import lines from './lines'
import notes from './notes'
import places from './places'
import series from './series'
import seriesLines from './seriesLines'
import tags from './tags'
import ui from './ui'

const mainReducer = combineReducers({
  beats,
  books,
  cards,
  categories,
  chapters,
  characters,
  customAttributes,
  file,
  images,
  lines,
  notes,
  places,
  series,
  seriesLines,
  tags,
  ui,
})

export default mainReducer
