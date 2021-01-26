import { combineReducers } from 'redux'
import { reducers } from 'pltr/v2'

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
  notes,
  places,
  series,
  seriesLines,
  tags,
  file,
  ui,
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
