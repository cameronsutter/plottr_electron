import { combineReducers } from 'redux'
import beats from './beats'
import books from './books'
import cards from './cards'
import categories from './categories'
import characters from './characters'
import customAttributes from './customAttributes'
import attributes from './attributes'
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
import editors from './editors'
import error from './error'
import permission from './permission'
import project from './project'
import client from './client'
import actions from './actions'
import license from './license'
import knownFiles from './knownFiles'
import templates from './templates'
import settings from './settings'
import backups from './backups'
import applicationState from './applicationState'
import imageCache from './imageCache'
import notifications from './notifications'
import domEvents from './domEvents'
import testingAndDiagnosis from './testingAndDiagnosis'

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
    attributes: attributes(dataRepairers),
    lines: lines(dataRepairers),
    notes: notes(dataRepairers),
    places: places(dataRepairers),
    tags: tags(dataRepairers),
    hierarchyLevels: hierarchyLevels(dataRepairers),
    images: images(dataRepairers),
    error: error(dataRepairers),
    permission: permission(dataRepairers),
    editors: editors(dataRepairers),
    project,
    client,
    actions,
    license,
    knownFiles,
    templates,
    settings,
    backups,
    applicationState,
    imageCache,
    notifications,
    domEvents,
    testingAndDiagnosis,
  })

export default mainReducer
