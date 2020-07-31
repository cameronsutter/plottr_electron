import path from 'path'
import fs from 'fs'
import { cloneDeep } from 'lodash'
import log from 'electron-log'
import { shell } from 'electron'
import i18n from 'format-message'
import xml from 'xml-js'
import { sortedChaptersByBookSelector, makeChapterTitleSelector } from '../../../../app/selectors/chapters'
import { cardMapSelector } from '../../../../app/selectors/cards'
import { sortCardsInChapter, cardMapping } from '../../../../app/helpers/cards'
import { isSeriesSelector } from '../../../../app/selectors/ui'
import { sortedLinesByBookSelector } from '../../../../app/selectors/lines'

export default function Exporter (state, exportPath) {
  console.log('Exporter', exportPath)
  let sceneCardIdMapping = {}

  const realPath = exportPath.includes('.scriv') ? exportPath : `${exportPath}.scriv`

  // create the structure of the project package
  try {
    createProjectStructure(realPath)
  } catch (error) {
    log.error(error)
    // don't go any further
    remove(realPath)
    return false
  }

  // create the .scrivx
  try {
    sceneCardIdMapping = createScrivx(state.present, realPath)
  } catch (error) {
    log.error(error)
    // don't go any further
    remove(realPath)
    return false
  }

  // create the rtf documents for each scene card
  createDocuments(state.present, sceneCardIdMapping, realPath)

  // show our work
  showOurWork(realPath)
}

function createProjectStructure (exportPath) {
  // create package folder
  try {
    // what if it already exists?
    const stat = fs.statSync(exportPath)

    if (stat.isDirectory()) {
      // delete current
      remove(exportPath)
      // and then create new
      fs.mkdirSync(exportPath)
    }
  } catch (error) {
    // doesn't exist, cool keep going
    fs.mkdirSync(exportPath)
  }

  // create Files & Files/Docs
  fs.mkdirSync(path.join(exportPath, 'Files', 'Docs'), {recursive: true})

  // create Settings
  fs.mkdirSync(path.join(exportPath, 'Settings'))
}

function createScrivx (state, basePath) {
  const scrivx = require('./bare_scrivx.json') // TODO: i18n names of BinderItems
  const binderItem = require('./binderItem.json')
  let nextId = 3
  let sceneCardIdMapping = {}

  // get current book id and select only those chapters/lines/cards
  const chapters = sortedChaptersByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const isSeries = isSeriesSelector(state)
  const chapterCardMapping = cardMapping(chapters, lines, card2Dmap, null)

  // create a BinderItem for each chapter (Type: Folder)
  //   create a BinderItem for each card (Type: Text)
  //   add scene card id to sceneCardIdMapping

  chapters.forEach(ch => {
    const uniqueChapterTitleSelector = makeChapterTitleSelector(state)
    const title = uniqueChapterTitleSelector(state, ch.id)
    const chapterItem = createChapterBinderItem(binderItem, title, nextId)

    // sort cards into chapters by lines (like outline auto-sorting)
    const cards = chapterCardMapping[ch.id]
    const sortedCards = sortCardsInChapter(ch.autoOutlineSort, cards, lines, isSeries)
    sortedCards.forEach(c => {
      ++nextId
      sceneCardIdMapping[c.id] = nextId + 0 // + 0 so that it will get the value, not the reference to nextId
      const cardItem = createCardBinderItem(binderItem, c, nextId)
      chapterItem['Children']['BinderItem'].push(cardItem)
    })

    scrivx['ScrivenerProject']['Binder']['BinderItem'][0]['Children']['BinderItem'].push(chapterItem)
    ++nextId
  })

  const data = xml.json2xml(scrivx, {compact: true, ignoreComment: true, spaces: 2})
  const baseName = path.basename(basePath).replace('.scriv', '')
  fs.writeFileSync(path.join(basePath, `${baseName}.scrivx`), data)

  return sceneCardIdMapping
}

function createDocuments (state, sceneCardIdMapping, basePath) {
  const realBasePath = path.join(basePath, 'Files', 'Docs')


}

function createChapterBinderItem (binderItem, title, id) {
  let data = cloneDeep(binderItem)
  data['_attributes']['ID'] = id
  data['_attributes']['Type'] = 'Folder'
  data['Title']['_text'] = title
  data['Children'] = {'BinderItem': []}
  return cloneDeep(data)
}

function createCardBinderItem (binderItem, card, id) {
  let data = cloneDeep(binderItem)
  data['_attributes']['ID'] = id
  data['Title']['_text'] = card.title
  return cloneDeep(data)
}

function showOurWork (exportPath) {
  try {
    new Notification(i18n('File Exported'), {body: i18n('Your Plottr file was exported to a Scrivener project package'), silent: true})
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(exportPath)
}

function remove (exportPath) {
  shell.moveItemToTrash(exportPath)
}