import fs, { readFileSync } from 'fs'
import xml from 'xml-js'
import { t } from 'plottr_locales'
import log from 'electron-log'
import path from 'path'
import { cloneDeep, keyBy, groupBy, isPlainObject } from 'lodash'

import { newIds, helpers, lineColors, initialState, tree } from 'pltr/v2'

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

// String, Bool, Object -> Promise<Object>
function ScrivenerImporter(filePath, isNewFile, state, convertRTFToSlate) {
  const scrivxJSON = getScrivxJson(filePath)
  const relevantFiles = findRelevantFiles(filePath)
  const inMemoryFiles = Promise.all(
    relevantFiles.map((filePath) => {
      if (path.extname(filePath) === '.txt') {
        return readFile(filePath).then((contents) => ({
          filePath,
          contents: createSlateParagraph(contents.toString()),
        }))
      } else if (path.extname(filePath) === '.rtf') {
        return readFile(filePath).then((contents) => {
          return convertRTFToSlate(contents).then((slateContent) => {
            return {
              filePath,
              contents: slateContent,
            }
          })
        })
      } else {
        return readFile(filePath).then((contents) => ({
          filePath,
          contents,
        }))
      }
    })
  )
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

  return inMemoryFiles.then((files) => {
    return withStoryLineIfItExists(manuscript, currentState, bookTitle, bookId, isNewFile, files)
  })
  // TODO:
  // .then
  // synopsis(currentState, json, bookTitle, bookId, isNewFile)
  // characters(currentState, json, bookId)
  // cards(currentState, json, bookId)
}

function withStoryLineIfItExists(manuscript, json, bookTitle, bookId, isNewFile, files) {
  if (
    manuscript['Children'] &&
    manuscript['Children']['BinderItem'] &&
    manuscript['Children']['BinderItem'].length
  ) {
    return extractStoryLines(json, manuscript, bookTitle, bookId, isNewFile, files)
  } else {
    return json
  }
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
  return [...currentCards, newCard]
}

function createNewLine(currentLines, values, bookId) {
  const nextLineId = nextId(currentLines)
  const position = nextPositionInBook(currentLines, bookId)
  const newLine = Object.assign({}, defaultLine, { id: nextLineId, position, bookId, ...values })
  currentLines.push(newLine)
  return nextLineId
}

function createNewBeat(currentState, values, bookId) {
  const beatTree = currentState.beats[bookId] || tree.newTree('id')
  const nextBeatId = beats.nextIdForBook(beatTree)
  const position = beats.nextPositionInTree(beatTree, null)
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
  return {
    ...currentState.beats,
    [bookId]: tree.addNode('id')(beatTree, null, node),
  }
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

function extractStoryLines(
  json,
  storyLineNode,
  bookTitle,
  bookId,
  isNewFile,
  relevantFiles,
  currentLineId
) {
  const chapters = storyLineNode['Children']['BinderItem']
  const lineId = !currentLineId
    ? createNewLine(json.lines, { position: 0, title: i18n('Main Plot') }, bookId)
    : currentLineId + 1

  const withNewBeats = chapters.reduce((acc, chapter, beatKey) => {
    const id = chapter['_attributes']['UUID'] || chapter['_attributes']['ID']
    const title = chapter['Title']['_text']
    const position = beatKey

    const newBeats = createNewBeat(acc, { id, title, position }, bookId)
    return {
      ...acc,
      beats: newBeats,
    }
  }, json)

  const withNewCardsAndNewBeats = chapters
    .filter((chapter) => {
      return (
        chapter['Children'] &&
        chapter['Children']['BinderItem'] &&
        chapter['Children']['BinderItem'].length
      )
    })
    .reduce((acc, chapter, beatKey) => {
      const beatChildrenWithStoryLines = chapter['Children']['BinderItem'].filter((child) => {
        return (
          child['Children'] &&
          child['Children']['BinderItem'] &&
          child['Children']['BinderItem'].length
        )
      })
      const withChildStoryLinesAdded = beatChildrenWithStoryLines.reduce(
        (newJson, child, beatChildKey) => {
          const childTitle = child['Title']['_text']
          createNewLine(json.lines, { position: currentLineId, title: childTitle }, bookId)
          return extractStoryLines(
            newJson,
            child['Children']['BinderItem'],
            bookTitle,
            bookId,
            isNewFile,
            relevantFiles,
            lineId
          )
        },
        acc
      )

      const beatChildrenWithoutStoryLines = chapter['Children']['BinderItem'].filter((child) => {
        return !(
          child['Children'] &&
          child['Children']['BinderItem'] &&
          child['Children']['BinderItem'].length
        )
      })
      return beatChildrenWithoutStoryLines.reduce((newJson, child, beatChildKey) => {
        const childId = child['_attributes']['UUID'] || child['_attributes']['ID']
        const childTitle = child['Title']['_text']
        const childPosition = beatChildKey

        const matchFiles = relevantFiles.filter(({ filePath }) => {
          const isVer_3_UUID = UUIDFolderRegEx.test(filePath)
          if (isVer_3_UUID) {
            return filePath.includes(childId)
          } else {
            return getVer_2_7_match(filePath, childId)
          }
        })
        let description = {}
        if (matchFiles.length) {
          matchFiles.map((file) => {
            const isTxt = path.extname(file.filePath) == '.txt'
            const isRTF = path.extname(file.filePath) == '.rtf'
            if (isTxt && path.basename(file.filePath).endsWith('synopsis.txt')) {
              description = file.contents
            } else if (isRTF) {
              const rtfContents = getRTFContents(json.lines, file, lineId, bookId)
              // console.log('rtfContents', JSON.stringify(rtfContents, null, 2))
            }
          })
        }
        // @Jeana Please could you decide what to do with rtfContent?
        return {
          ...newJson,
          cards: createNewCard(newJson.cards, {
            uuid: childId,
            title: childTitle || i18n('Scene {num}', { num: beatKey + 1 }),
            position: childPosition,
            description,
            beatId: beatKey,
            lineId,
          }),
        }
      }, withChildStoryLinesAdded)
    }, withNewBeats)

  return withNewCardsAndNewBeats
}

function getRTFContents(lines, rtf, lineId, bookId) {
  let plotlines = []
  if (rtf.contents && rtf.contents.length) {
    return rtf.contents.map((content) => {
      if (content.type == 'plotline') {
        const plotlineValue = content.children[0].text
        if (!plotlineValue.includes(plotlines)) {
          createNewLine(
            lines,
            {
              position: lineId,
              title: content.children[0].text,
              color: nextColor(lineId),
            },
            bookId
          )
          plotlines.push(plotlineValue)
        }
      } else if (content.type == 'text') {
        // TODO custom attrib
      }
    })
  }
}

export { ScrivenerImporter }
