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
import featureFlags from './featureFlags'
import tour from './tours'
import error from './error'
import permission from './permission'
import project from './project'

// normally it would make more sense to alphabetize them
// but for customer service, it helps a lot to have them in a specific order
// to pick out some important things at the top
const mainReducer = (dataRepairers) =>
  combineReducers({
    file: file(dataRepairers),
    ui: ui(dataRepairers),
    featureFlags: featureFlags(dataRepairers),
    series: series(dataRepairers),
    books: books(dataRepairers),
    beats: beats(dataRepairers),
    cards: cards(dataRepairers),
    categories: categories(dataRepairers),
    characters: characters(dataRepairers),
    customAttributes: customAttributes(dataRepairers),
    lines: lines(dataRepairers),
    notes: notes(dataRepairers),
    places: places(dataRepairers),
    tags: tags(dataRepairers),
    hierarchyLevels: hierarchyLevels(dataRepairers),
    tour: tour(dataRepairers),
    images: images(dataRepairers),
    error: error(dataRepairers),
    permission: permission(dataRepairers),
    project,
  })

export default mainReducer
