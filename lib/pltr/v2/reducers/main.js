import { combineReducers } from 'redux'
import beats from './beats'
import books from './books'
import cards from './cards'
import categories from './categories'
import characters from './characters'
import customAttributes from './customAttributes'
import file from './file'
import images from './images'
import lines from './lines'
import notes from './notes'
import places from './places'
import series from './series'
import tags from './tags'
import ui from './ui'
import hierarchyLevels from './hierarchy'

// normally it would make more sense to alphabetize them
// but for customer service, it helps a lot to have them in a specific order
// to pick out some important things at the top
const mainReducer = combineReducers({
  file,
  ui,
  series,
  books,
  beats,
  cards,
  categories,
  characters,
  customAttributes,
  lines,
  notes,
  places,
  tags,
  images,
  hierarchyLevels,
})

export default mainReducer
