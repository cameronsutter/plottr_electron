import path from 'path'
import fs from 'fs'
import { cloneDeep, keyBy } from 'lodash'
import log from 'electron-log'
import { shell } from 'electron'
import i18n from 'format-message'
import xml from 'xml-js'
import rtf from 'jsrtf'
import { sortedChaptersByBookSelector, makeChapterTitleSelector } from '../../../../app/selectors/chapters'
import { cardMapSelector } from '../../../../app/selectors/cards'
import { sortCardsInChapter, cardMapping } from '../../../../app/helpers/cards'
import { isSeriesSelector } from '../../../../app/selectors/ui'
import { sortedLinesByBookSelector } from '../../../../app/selectors/lines'
import serialize from '../../../slate_serializers/to_rtf'

export default function Exporter (state, exportPath) {
  const realPath = exportPath.includes('.scriv') ? exportPath : `${exportPath}.scriv`

  try {
    // create the structure of the project package
    createProjectStructure(realPath)

    // create the .scrivx
    let sceneCardsByDocID = createScrivx(state.present, realPath)

    // create the rtf documents for each scene card
    createDocuments(sceneCardsByDocID, realPath)
  } catch (error) {
    log.error(error)
    // move anything we've made to the trash
    remove(realPath)
    // don't go any further
    return false
  }

  notifyUser(realPath)
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
  let sceneCardsByDocID = {}

  // get current book id and select only those chapters/lines/cards
  const chapters = sortedChaptersByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const isSeries = isSeriesSelector(state)
  const chapterCardMapping = cardMapping(chapters, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')

  // create a BinderItem for each chapter (Type: Folder)
  //   create a BinderItem for each card (Type: Text)

  chapters.forEach(ch => {
    const uniqueChapterTitleSelector = makeChapterTitleSelector(state)
    const title = uniqueChapterTitleSelector(state, ch.id)
    const chapterItem = createChapterBinderItem(binderItem, title, nextId)

    // sort cards into chapters by lines (like outline auto-sorting)
    const cards = chapterCardMapping[ch.id]
    const sortedCards = sortCardsInChapter(ch.autoOutlineSort, cards, lines, isSeries)
    sortedCards.forEach(c => {
      ++nextId
      const cardItem = createCardBinderItem(binderItem, c, nextId)
      chapterItem['Children']['BinderItem'].push(cardItem)

      // save card info into sceneCardsByDocID
      let title = ''
      const lineId = isSeries ? c.seriesLineId : c.lineId
      const line = linesById[lineId]
      if (line) title = line.title

      sceneCardsByDocID[nextId + 0] = {lineTitle: title, description: c.description} // + 0 so that it will get the value, not the reference to nextId
    })

    scrivx['ScrivenerProject']['Binder']['BinderItem'][0]['Children']['BinderItem'].push(chapterItem)
    ++nextId
  })

  const data = xml.json2xml(scrivx, {compact: true, ignoreComment: true, spaces: 2})
  const baseName = path.basename(basePath).replace('.scriv', '')
  fs.writeFileSync(path.join(basePath, `${baseName}.scrivx`), data)

  return sceneCardsByDocID
}

function createDocuments (sceneCardsByDocID, basePath) {
  const realBasePath = path.join(basePath, 'Files', 'Docs')

  Object.keys(sceneCardsByDocID).forEach(docID => {
    // card is {lineTitle: '', description: []}
    const card = sceneCardsByDocID[docID]
    // NOT DOING: create a {docID}_synopsis.txt file for the line title

    // create a {docID}_notes.rtf file for the card description
    let doc = new rtf()
    let data = null
    if (card.lineTitle) {
      doc.writeText(i18n('Plotline: {name}', {name: card.lineTitle}))
      doc.addLine()
      doc.addLine()
      // fs.writeFileSync(path.join(realBasePath, `${docID}_synopsis.txt`), card.lineTitle)
    }
    try {
      serialize(card.description, doc)
      data = doc.createDocument()
      // may have to do this … but it doesn't look like it
      // const buffer = new Buffer(data, 'binary')
      fs.writeFileSync(path.join(realBasePath, `${docID}_notes.rtf`), data)
    } catch (error) {
      log.error(error)
      // do nothing, just don't blow up
    }
  })

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

function notifyUser (exportPath) {
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