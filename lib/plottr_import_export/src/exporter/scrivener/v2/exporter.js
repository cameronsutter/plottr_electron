import xml from 'xml-js'
import rtf from 'jsrtf'
import { slate } from 'pltr/v2'
import exportBeats from './exporters/beats'
import exportCharacters from './exporters/characters'
import exportNotes from './exporters/notes'
import exportPlaces from './exporters/places'
import { convertUnicode, addToScrivx, remove, startNewScrivx } from './utils'

const { serialize } = slate.rtf
const serializePlain = slate.plain.serialize

export default function Exporter(
  state,
  exportPath,
  options,
  isWindows,
  notifyUser,
  log,
  rm,
  join,
  writeFile,
  stat,
  mkdir
) {
  const realPath = exportPath.includes('.scriv') ? exportPath : `${exportPath}.scriv`

  return createProjectStructure(realPath, rm, stat, mkdir, join)
    .then(() => {
      // create the .scrivx
      return createScrivx(state, realPath, options).then((documentContents) => {
        // create the rtf documents for each scene card
        return createRTFDocuments(
          documentContents,
          realPath,
          options,
          isWindows,
          log,
          join,
          writeFile
        )
      })
    })
    .catch((error) => {
      log.error(error)
      // move anything we've made to the trash
      return remove(realPath, rm).then(() => {
        // don't go any further
        return Promise.reject(error)
      })
    })
    .then(() => {
      return notifyUser(realPath, 'scrivener')
    })
}

function createProjectStructure(exportPath, rm, stat, mkdir, join) {
  // create package folder
  return stat(exportPath)
    .then((stats) => {
      // if it already exists: overwrite (OS should have already asked)
      if (stats.isDirectory) {
        // delete current
        return remove(exportPath, rm).then(() => {
          // and then create new
          return mkdir(exportPath)
        })
      }
      return true
    })
    .catch((error) => {
      if (error.code === 'ENOENT') {
        // doesn't exist, cool keep going
        return mkdir(exportPath)
      } else {
        return Promise.reject(error)
      }
    })
    .then(() => {
      // create Files & Files/Docs
      return join(exportPath, 'Files', 'Docs')
        .then((docsPath) => {
          return mkdir(docsPath, { recursive: true })
        })
        .then(() => {
          // create Settings
          return join(exportPath, 'Settings').then((settingsPath) => {
            return mkdir(settingsPath)
          })
        })
    })
}

function createScrivx(state, basePath, options, basename, join, writeFile) {
  let scrivx = startNewScrivx()
  let documentContents = {}

  if (options.outline.export) {
    const beatBinderItems = exportBeats(state, documentContents, options)
    addToScrivx(scrivx, beatBinderItems, 'main')
  }

  if (options.characters.export) {
    const charactersBinderItem = exportCharacters(state, documentContents, options)
    addToScrivx(scrivx, charactersBinderItem, 'research')
  }

  if (options.places.export) {
    const placesBinderItem = exportPlaces(state, documentContents, options)
    addToScrivx(scrivx, placesBinderItem, 'research')
  }

  if (options.notes.export) {
    const notesBinderItem = exportNotes(state, documentContents, options)
    addToScrivx(scrivx, notesBinderItem, 'research')
  }

  const data = xml.json2xml(scrivx, { compact: true, ignoreComment: true, spaces: 2 })
  return basename(basePath)
    .then((baseName) => {
      return baseName.replace('.scriv', '')
    })
    .then((baseName) => {
      return join(basePath, `${baseName}.scrivx`)
        .then((scrivxPath) => {
          return writeFile(scrivxPath, data)
        })
        .then(() => {
          return documentContents
        })
    })
}

function createRTFDocuments(documentContents, basePath, isWindows, log, join, writeFile) {
  return join(basePath, 'Files', 'Docs').then((realBasePath) => {
    return Promise.all(
      Object.keys(documentContents).map((docID) => {
        // documentContents is {notes: <document>, body: <document>, synopsis: <document>}
        // document is {docTitle: '', description: []}
        const documents = documentContents[docID]

        const createNotes = documents.notes
          ? createRTF(docID, documents.notes, realBasePath, true, log, join, writeFile)
          : Promise.resolve()

        const createBody = createNotes.then(() => {
          return documents.body
            ? createRTF(docID, documents.body, realBasePath, false, log, join, writeFile)
            : Promise.resolve()
        })

        const finalOperation = createBody.then(() => {
          return documents.synopsis
            ? createSynopsis(
                docID,
                documents.synopsis,
                realBasePath,
                isWindows,
                log,
                join,
                writeFile
              )
            : Promise.resolve()
        })

        return finalOperation
      })
    )
  })
}

function createRTF(docID, document, realBasePath, isNotes, log, join, writeFile) {
  let doc = new rtf()
  let data = null
  if (document.docTitle) {
    doc.writeText(document.docTitle)
    doc.addLine()
    doc.addLine()
  }
  try {
    serialize(document.description, doc)
    data = doc.createDocument()
    data = convertUnicode(data)
    data = Buffer.from(data, 'utf8')
    const fileName = isNotes ? `${docID}_notes.rtf` : `${docID}.rtf`
    return join(realBasePath, fileName)
      .then((filePath) => {
        return writeFile(filePath, data)
      })
      .catch((error) => {
        log.error(error)
        // do nothing, just don't blow up
        return Promise.resolve()
      })
  } catch (error) {
    log.error(error)
    // do nothing, just don't blow up
    return Promise.resolve()
  }
}

function createSynopsis(docID, document, realBasePath, isWindows, log, join, writeFile) {
  try {
    const data = serializePlain(document.description, isWindows)
    const fileName = `${docID}_synopsis.txt`
    return join(realBasePath, fileName)
      .then((synopsisPath) => {
        return writeFile(synopsisPath, data)
      })
      .catch((error) => {
        log.error(error)
      })
  } catch (error) {
    log.error(error)
    // do nothing, just don't blow up
    return Promise.resolve()
  }
}
