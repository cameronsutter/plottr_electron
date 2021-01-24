import { combineReducers } from 'redux'
import { reducers } from 'pltr/v2'
import ui from './ui'
import file from './file'
import places from './places'
import tags from './tags'
import notes from './notes'
import series from './series'
import seriesLines from './seriesLines'

const {
  customAttributes,
  lines,
  beats,
  books,
  cards,
  categories,
  chapters,
  characters,
  images,
} = reducers

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
