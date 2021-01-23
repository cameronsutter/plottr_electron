import { combineReducers } from 'redux'
import { reducers } from 'pltr/v2'
import ui from './ui'
import file from './file'
import places from './places'
import tags from './tags'
import characters from './characters'
import notes from './notes'
import images from './images'
import series from './series'
import seriesLines from './seriesLines'

const { customAttributes, lines, beats, books, cards, categories, chapters } = reducers

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
