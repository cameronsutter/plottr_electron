import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import xml from 'xml-js'
import rtf from 'jsrtf'
import serialize from '../../../slate_serializers/to_rtf'
import { notifyUser } from '../../notifier'
import exportBeats from './exporters/beats'
import exportCharacters from './exporters/characters'
import exportNotes from './exporters/notes'
import exportPlaces from './exporters/places'
import { convertUnicode, addToScrivx, remove, startNewScrivx } from './utils'

export default function Exporter(state, exportPath, options) {
  const realPath = exportPath.includes('.scriv') ? exportPath : `${exportPath}.scriv`

  try {
    // create the structure of the project package
    createProjectStructure(realPath)

    // create the .scrivx
    let documentContents = createScrivx(state, realPath)

    // create the rtf documents for each scene card
    createRTFDocuments(documentContents, realPath)
  } catch (error) {
    log.error(error)
    // move anything we've made to the trash
    remove(realPath)
    // don't go any further
    return false
  }

  notifyUser(realPath, 'scrivener')
}

function createProjectStructure(exportPath) {
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
  fs.mkdirSync(path.join(exportPath, 'Files', 'Docs'), { recursive: true })

  // create Settings
  fs.mkdirSync(path.join(exportPath, 'Settings'))
}

function createScrivx(state, basePath) {
  let scrivx = startNewScrivx()
  let documentContents = {}

  const beatBinderItems = exportBeats(state, documentContents)
  addToScrivx(scrivx, beatBinderItems, 'main')

  const charactersBinderItem = exportCharacters(state, documentContents)
  addToScrivx(scrivx, charactersBinderItem, 'research')

  const placesBinderItem = exportPlaces(state, documentContents)
  addToScrivx(scrivx, placesBinderItem, 'research')

  const notesBinderItem = exportNotes(state, documentContents)
  addToScrivx(scrivx, notesBinderItem, 'research')

  const data = xml.json2xml(scrivx, { compact: true, ignoreComment: true, spaces: 2 })
  const baseName = path.basename(basePath).replace('.scriv', '')
  fs.writeFileSync(path.join(basePath, `${baseName}.scrivx`), data)

  return documentContents
}

function createRTFDocuments(documentContents, basePath) {
  const realBasePath = path.join(basePath, 'Files', 'Docs')

  Object.keys(documentContents).forEach((docID) => {
    // documentContents is {docTitle: '', description: [], isNotesDoc: true}
    const document = documentContents[docID]
    // NOT DOING: create a {docID}_synopsis.txt file for the line title

    // create a {docID}_notes.rtf file for the document description
    let doc = new rtf()
    let data = null
    if (document.docTitle) {
      doc.writeText(document.docTitle)
      doc.addLine()
      doc.addLine()
      // fs.writeFileSync(path.join(realBasePath, `${docID}_synopsis.txt`), document.docTitle)
    }
    try {
      serialize(document.description, doc)
      data = doc.createDocument()
      data = convertUnicode(data)
      data = Buffer.from(data, 'utf8')
      const fileName = document.isNotesDoc ? `${docID}_notes.rtf` : `${docID}.rtf`
      fs.writeFileSync(path.join(realBasePath, fileName), data)
    } catch (error) {
      log.error(error)
      // do nothing, just don't blow up
    }
  })
}
