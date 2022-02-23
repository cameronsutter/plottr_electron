import fs, { readFileSync } from 'fs'
import xml from 'xml-js'
import { t } from 'plottr_locales'
import path from 'path'
import log from 'electron-log'
import { cloneDeep, keyBy, groupBy, isPlainObject } from 'lodash'
import { newIds, helpers, lineColors, initialState, tree } from 'pltr/v2'
import { convertHTMLString } from 'pltr/v2/slate_serializers/from_html'
import rtfToHTML from '@iarna/rtf-to-html'

const i18n = t
const { readFile } = fs.promises
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

  // manuscript folder from the scrivener is where we get the beats
  const manuscript = scrivxJSON['ScrivenerProject']['Binder']['BinderItem'].find(
    (n) => n['_attributes']['Type'] == 'DraftFolder' || n['Title']['_text'] == 'Manuscript'
  )

  if (
    manuscript['Children'] &&
    manuscript['Children']['BinderItem'] &&
    manuscript['Children']['BinderItem'].length
  ) {
    storyLine(currentState, manuscript, bookTitle, bookId, isNewFile, relevantFiles, true)
  }
  // synopsis(currentState, json, bookTitle, bookId, isNewFile)
  // characters(currentState, json, bookId)
  // cards(currentState, json, bookId)
  console.log('currentState', JSON.stringify(currentState, null, 2))
  return currentState
}

function getScrivxJson(filePath) {
  const filesInScriv = fs.readdirSync(filePath)
  const scrivFile = filesInScriv.find((file) => path.extname(file) === '.scrivx')
  const absolute = path.join(filePath, scrivFile)
  const scrivxContent = fs.readFileSync(absolute, 'utf-8')
  const json = JSON.parse(xml.xml2json(scrivxContent, { compact: true, spaces: 2 }))

  return json
}

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

function createSlateParagraph(value) {
  return { children: [{ text: value }] }
}

function getVer_2_7_match(file, childId) {
  const fileName = path.basename(file)
  if (fileName.endsWith('_synopsis.txt') || fileName.endsWith('_notes.rtf')) {
    return fileName.split('_')[0] == childId
  } else {
    const uuid = fileName.replace('.rtf', '') || fileName.replace('.txt', '')
    return uuid == childId
  }
}

// String, -> Object
function readTxtFile(file) {
  const raw = readFileSync(file)
  if (raw && raw.toString()) {
    return createSlateParagraph(raw.toString())
  }
}

// String, -> Promise<any>
function readRTFFile(file) {
  const rawRTF = readFileSync(file)
  return new Promise((resolve, reject) =>
    rtfToHTML.fromString(rawRTF.toString(), (err, html) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(convertHTMLString(html))
      }
    })
  )
}

function storyLine(
  currentState,
  storyLineNode,
  bookTitle,
  bookId,
  isNewFile,
  relevantFiles,
  currentLineId
) {
  const chapters = storyLineNode['Children']['BinderItem']
  let description = {}

  // if not newBook it means that it is a subfolder,
  // TODO: create new line fromm the subfolder
  // no subfolder means default plotline || `Main Plot`
  const lineId = currentLineId
    ? createNewLine(currentState.lines, { position: 0, title: i18n('Main Plot') }, bookId)
    : createNewLine(
        currentState.lines,
        { position: currentLineId, title: i18n('Subfolder title') },
        bookId
      )

  chapters.map((chapter, beatKey) => {
    const id = chapter['_attributes']['UUID'] || chapter['_attributes']['ID']
    const title = chapter['Title']['_text']
    const position = beatKey
    if (
      chapter['Children'] &&
      chapter['Children']['BinderItem'] &&
      chapter['Children']['BinderItem'].length
    ) {
      let beatChildren = chapter['Children']['BinderItem']
      beatChildren.map((child, beatChildKey) => {
        const childId = child['_attributes']['UUID'] || child['_attributes']['ID']
        const childTitle = child['Title']['_text']
        const childPosition = beatChildKey
        if (
          child['Children'] &&
          child['Children']['BinderItem'] &&
          child['Children']['BinderItem'].length
        ) {
          return storyLine(
            currentState,
            child['Children']['BinderItem'],
            bookTitle,
            bookId,
            isNewFile,
            relevantFiles,
            lineId
          )
        }
        const matchFiles = relevantFiles.filter((file) => {
          const isVer_3_UUID = UUIDFolderRegEx.test(file)
          if (isVer_3_UUID) {
            return file.includes(childId)
          } else {
            return getVer_2_7_match(file, childId)
          }
        })
        if (matchFiles.length) {
          matchFiles.map((file) => {
            const isTxt = path.extname(file) == '.txt'
            const isRTF = path.extname(file) == '.rtf'
            if (isTxt && path.basename(file).endsWith('synopsis.txt')) {
              description = readTxtFile(file)
            } else if (isRTF) {
              // rtfContent = readRTFFile(file)
              //   .then((data) => console.log('rtfdata', data))
              //   .catch((error) => {
              //     console.log('RTF Error', error)
              //   })
            }
          })
        }
        createNewCard(currentState.cards, {
          uuid: childId,
          title: childTitle || i18n('Scene {num}', { num: beatKey + 1 }),
          position: childPosition,
          description,
          beatId: beatKey,
          lineId,
        })
      })
    }
    createNewBeat(currentState, { id, title, position })
  })
}

export { ScrivenerImporter }
