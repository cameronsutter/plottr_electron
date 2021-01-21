import { combineReducers } from 'redux'
import { reducers } from 'pltr/v2'
import ui from './ui'
import file from './file'
import places from './places'
import tags from './tags'
import characters from './characters'
import chapters from './chapters'
import cards from './cards'
import lines from './lines'
import notes from './notes'
import images from './images'
import beats from './beats'
import books from './books'
import series from './series'
import seriesLines from './seriesLines'
import categories from './categories'

const { customAttributes } = reducers

const mainReducer = combineReducers({
  ui,
  file,
  series,
  books,
  characters,
  chapters,
  cards,
  lines,
  customAttributes,
  places,
  tags,
  notes,
  beats,
  seriesLines,
  categories,
  images,
})

export default mainReducer
