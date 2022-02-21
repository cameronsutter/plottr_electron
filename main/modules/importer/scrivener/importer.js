const fs = require('fs')
const { readFile } = fs.promises
const xml = require('xml-js')
const { t } = require('plottr_locales')
const path = require('path')
const log = require('electron-log')
const DomParser = require('dom-parser')
const i18n = t
const { cloneDeep, keyBy, groupBy, isPlainObject } = require('lodash')
const { newIds, helpers, lineColors, initialState, tree } = require('pltr/v2')
const { rtfConverter } = require('pltr/v2/slate_serializers/to_html')
const { HTMLToPlotlineParagraph } = require('pltr/v2/slate_serializers/from_html')
const { func } = require('react-proptypes')

const { nextColor } = lineColors
const defaultBook = initialState.book
const defaultNote = initialState.note
const defaultCharacter = initialState.character
const defaultCard = initialState.card
const defaultLine = initialState.line

const { nextId, objectId } = newIds
const {
  beats,
  lists: { nextPositionInBook },
} = helpers

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/

function ScrivenerImporter(filePath, isNewFile, state) {
  const scrivxJSON = getScrivxJson(filePath)
  const relevantFiles = findRelevantFiles(filePath)
  // const state = contentRTF.then((content) => generateState(content, scrivx))
  const currentState = cloneDeep(state)
  // const books
  // create a new book (if not new file)
  let bookId = 1
  if (!isNewFile) {
    bookId = createNewBook(currentState.books)
  }

  const bookTitle = path.basename(filePath, '.scriv')

  console.log('scrivxJSON', scrivxJSON)
  const parsedFiles = parseRelevantFiles(relevantFiles)
  storyLine(currentState, scrivxJSON, bookTitle, bookId, isNewFile, relevantFiles)
  // synopsis(currentState, json, bookTitle, bookId, isNewFile)
  // characters(currentState, json, bookId)
  // cards(currentState, json, bookId)
  // console.log('currentState', currentState)
  return currentState
}

function parseRelevantFiles(files) {
  return files.map(function (file) {
    const isRTFFile = path.extname(file) == '.rtf'
    if (isRTFFile) {
      return readFile(file).then(function (raw) {
        const stringRTF = raw.toString()
        return rtfConverter(stringRTF).then(function (res) {
          return res
        })
      })
    }
  })
}

function getScrivxJson(filePath) {
  const filesInScriv = fs.readdirSync(filePath)
  const scrivFile = filesInScriv.find((file) => path.extname(file) === '.scrivx')
  const absolute = path.join(filePath, scrivFile)
  const scrivxContent = fs.readFileSync(absolute, 'utf-8')
  const json = JSON.parse(xml.xml2json(scrivxContent, { compact: true, spaces: 2 }))

  return json
}

function parseScrivxData(data) {
  const parser = new DomParser()
  const htmlData = parser.parseFromString('<body>' + data + '</body>')
  const scrivXML = htmlData.rawHTML
  const rootChild = scrivXML.getElementsByTagName('BinderItem')[0]
}

// Node, Number -> [{ uuid: String, title: string, children: [any] }]
// function getBinderContents(root, isDraftFolder) {
//   return Array.from(root).map((bindersItem, key) => {
//     const uuid = bindersItem.getAttribute('uuid') || bindersItem.getAttribute('id')
//     const titleElement = bindersItem.querySelector('Title')
//     const binderChildren = bindersItem.querySelector('Children')
//     let title = ''

//     if (titleElement && titleElement.length && titleElement.textContent) {
//       title = titleElement.textContent
//     }

//     if (binderChildren && binderChildren.children && binderChildren.children.length) {
//       const contentChildren = getBinderContents(binderChildren.children)
//       return {
//         uuid,
//         title,
//         children: contentChildren,
//       }
//     } else if (isDraftFolder && !binderChildren) {
//       return {
//         uuid,
//         title,
//         children: [
//           {
//             uuid,
//             title: `Chapter ${key + 1}`,
//           },
//         ],
//       }
//     } else {
//       return {
//         uuid,
//         title,
//       }
//     }
//   })
// }

// [{ filePath: String, isRelevant: Bool }] -> [String]
function keepNonSectionRTFFiles(results) {
  return results.filter(({ isRelevant }) => !isRelevant).map(({ filePath }) => filePath)
}

// [{ filePath: String, isRelevant: Bool }] -> [String]
function keepSectionRTFFiles(results) {
  return results.filter(({ isRelevant }) => isRelevant).map(({ filePath }) => filePath)
}

// String -> Promise<[String]>
function findRelevantFiles(directory) {
  const filesInDirectory = fs.readdirSync(directory)
  const checkedEntries = filesInDirectory.map((file) => isRelevantFile(directory, file))
  const folders = keepOnlyFolders(keepNonSectionRTFFiles(checkedEntries))
  const sectionRTFFiles = keepSectionRTFFiles(checkedEntries)
  const filesForSubFolders = folders.map(findRelevantFiles)

  return sectionRTFFiles.concat(...filesForSubFolders)
}

// String -> Promise<Bool>
function isFolder(filePath) {
  const result = fs.statSync(filePath)
  return result.isDirectory()
}

// [String] -> Promise<[String]>
function keepOnlyFolders(paths) {
  const testedPaths = paths.map((path) => {
    return {
      isAFolder: isFolder(path) ? true : false,
      path,
    }
  })
  return testedPaths.filter(({ isAFolder }) => isAFolder).map(({ path }) => path)
}

// String, String -> Promise<{filePath: String, isRelevant: Bool}>
function isRelevantFile(directory, fileName) {
  const filePath = toFullPath(directory, fileName)
  const relevantFile = path.extname(fileName) === '.rtf' || path.extname(fileName) === '.txt'

  if (isFolder(filePath)) {
    return {
      filePath,
      isRelevant: relevantFile ? true : false,
    }
  } else {
    const fileContents = fs.readFileSync(filePath)
    if (fileContents) {
      return {
        filePath,
        isRelevant: relevantFile ? true : false,
      }
    } else {
      return false
    }
  }
}

// String, String -> String
function toFullPath(directory, filePath) {
  return path.join(directory, filePath)
}

function createNewBook(currentBooks) {
  const nextBookId = objectId(currentBooks.allIds)
  const newBook = Object.assign({}, defaultBook, { id: nextBookId })
  currentBooks.allIds.push(nextBookId)
  currentBooks[`${nextBookId}`] = newBook

  return nextBookId
}

function createNewNote(currentNotes, values) {
  const nextNoteId = nextId(currentNotes)
  const newNote = Object.assign({}, defaultNote, { id: nextNoteId, ...values })
  currentNotes.push(newNote)
}

function createNewCharacter(currentCharacters, values) {
  const nextCharacterId = nextId(currentCharacters)
  const newCharacter = Object.assign({}, defaultCharacter, { id: nextCharacterId, ...values })
  currentCharacters.push(newCharacter)
}

function createNewCard(currentCards, values) {
  const nextCardId = nextId(currentCards)
  const newCard = Object.assign({}, defaultCard, { id: nextCardId, ...values })
  currentCards.push(newCard)
}

function createNewLine(currentLines, values, bookId) {
  const nextLineId = nextId(currentLines)
  const position = nextPositionInBook(currentLines, bookId)
  const newLine = Object.assign({}, defaultLine, { id: nextLineId, position, bookId, ...values })
  currentLines.push(newLine)
  return nextLineId
}

function createNewBeat(currentState, values, bookId) {
  if (!currentState.beats[bookId]) {
    currentState.beats[bookId] = tree.newTree('id')
  }
  const nextBeatId = beats.nextId(currentState.beats)
  const position = beats.nextPositionInBook(currentState, bookId, null)
  const node = {
    autoOutlineSort: true,
    bookId: bookId,
    fromTemplateId: null,
    id: nextBeatId,
    position,
    time: 0,
    expanded: true,
    title: 'auto',
    ...values,
  }
  const beatTree = currentState.beats[bookId]
  currentState.beats[bookId] = tree.addNode('id')(beatTree, null, node)

  return nextBeatId
}

function createSlateEditor(paragraphs) {
  return paragraphs.map(createSlateParagraph)
}

function createSlateParagraph(value) {
  return { children: [{ text: value }] }
}

function createSlateParagraphWithMark(value, mark) {
  return { children: [{ text: value, [mark]: true }] }
}

function getVer_2_7_match(file, child) {
  const fileName = file.split('/').pop()
  if (file.endsWith('_synopsis.txt') || file.endsWith('_notes.rtf')) {
    return fileName.split('_')[0] == child.uuid
  } else {
    const uuid = fileName.replace('.rtf', '')
    return uuid == child.uuid
  }
}

function storyLine(currentState, json, bookTitle, bookId, isNewFile, relevantFiles) {
  const storyLineNode = json['ScrivenerProject']['Binder']['BinderItem'].find(
    (n) => n['_attributes']['Type'] == 'DraftFolder' || n['Title']['_text'] == 'Manuscript'
  )

  if (
    storyLineNode['Children'] &&
    storyLineNode['Children']['BinderItem'] &&
    storyLineNode['Children']['BinderItem'].length
  ) {
    const chapters = storyLineNode['Children']['BinderItem']
    chapters.map((chapter, beatKey) => {
      const id = chapter['_attributes']['UUID']
      const title = chapter['Title']['_text']
      const position = beatKey
      if (
        chapter['Children'] &&
        chapter['Children']['BinderItem'] &&
        chapter['Children']['BinderItem'].length
      ) {
        let beatChildren = chapter['Children']['BinderItem']
        beatChildren.map((child, key) => {
          const childId = child['_attributes']['UUID']
          const childTitle = child['Title']['_text']
          const childPosition = key
          const matchFiles = relevantFiles.find((file) => file.includes(childId))
          // const isVer_3_UUID = UUIDFolderRegEx.test(child.uuid)
          // if (isVer_3_UUID) {
          //   return file.includes(child.uuid)
          // } else {
          //   return getVer_2_7_match(file, child)
          // }
          // console.log('matchFiles', JSON.stringify(matchFiles, null, 2))
        })
        // const lines = beatChildren['BinderItem']
        console.log('lines', JSON.stringify(beatChildren, null, 2))
      }
      createNewBeat(currentState, { id, title, position })
    })
  }
}

module.exports = { ScrivenerImporter }
