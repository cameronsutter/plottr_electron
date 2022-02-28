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
const defaultPlace = initialState.place
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

  const sectionsJSON = scrivxJSON['ScrivenerProject']['Binder']['BinderItem'].filter(
    (n) => n['_attributes']['Type'] != 'DraftFolder' && n['_attributes']['Type'] != 'TrashFolder'
  )

  const notes = getSection(sectionsJSON, 'Notes')
  const characters = getSection(sectionsJSON, 'Characters')
  const places = getSection(sectionsJSON, 'Places')

  return inMemoryFiles.then((files) => {
    // console.log('files', JSON.stringify(files, null, 2))
    withStoryLineIfItExists(manuscript, currentState, bookTitle, bookId, isNewFile, files)

    if (notes && notes.length && notes[0]['Children'] && notes[0]['Children']['BinderItem']) {
      const notesBinderItem = Array.isArray(notes[0]['Children']['BinderItem'])
        ? notes[0]['Children']['BinderItem']
        : [notes[0]['Children']['BinderItem']]
      generateNotes(currentState, notesBinderItem, bookId, files, isNewFile)
    }

    if (places && places.length && places[0]['Children'] && places[0]['Children']['BinderItem']) {
      const placesBinderItem = Array.isArray(places[0]['Children']['BinderItem'])
        ? places[0]['Children']['BinderItem']
        : [places[0]['Children']['BinderItem']]
      generatePlaces(currentState, placesBinderItem, bookId, files, isNewFile)
    }

    if (
      characters &&
      characters.length &&
      characters[0]['Children'] &&
      characters[0]['Children']['BinderItem']
    ) {
      const charactersBinderItem = Array.isArray(characters[0]['Children']['BinderItem'])
        ? characters[0]['Children']['BinderItem']
        : [characters[0]['Children']['BinderItem']]
      generateCharacters(currentState, charactersBinderItem, bookId, files, isNewFile)
    }
    // console.log('currentState', JSON.stringify(currentState, null, 2))
  })
  // TODO:
  // .then
  // synopsis(currentState, json, bookTitle, bookId, isNewFile)
  // characters(currentState, json, bookId)
  // cards(currentState, json, bookId)
}

const getSection = (sections, sectionName) => {
  return sections.map((n) => {
    // in ver2.7 Notes is usually Parent Folder and have subfolders of Notes, Characters and Places
    if (
      n['_attributes']['Type'] == 'ResearchFolder' &&
      n['Children'] &&
      n['Children']['BinderItem'] &&
      n['Children']['BinderItem'].length
    ) {
      const section = n['Children']['BinderItem'].find(
        (childBinderItem) =>
          childBinderItem['_attributes']['Type'] == 'Folder' &&
          childBinderItem['Title']['_text'] == sectionName
      )
      return section
    } else if (
      n['_attributes']['Type'] == 'Folder' &&
      n['Children'] &&
      n['Children']['BinderItem'] &&
      n['Title']['_text'] == sectionName
    ) {
      return n
    } else {
      // TODO other folder structure to find notes, chars and places
      // console.log('else =>', n['Children']['BinderItem'])
      // console.log('else type =>', n['_attributes']['Type'])
    }
  })
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

function createNewPlace(currentPlaces, values) {
  const nextPlaceId = nextId(currentPlaces)
  const newNote = Object.assign({}, defaultPlace, { id: nextPlaceId, ...values })
  currentPlaces.push(newNote)
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
  let lineId = currentLineId || 1

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
    .reduce((acc, chapter, beatId) => {
      const beatChildrenWithStoryLines = chapter['Children']['BinderItem'].filter((child) => {
        return (
          child['Children'] &&
          child['Children']['BinderItem'] &&
          child['Children']['BinderItem'].length
        )
      })
      const withChildStoryLinesAdded = beatChildrenWithStoryLines.reduce(
        (newJson, child, nextLinePosition) => {
          const childId = child['_attributes']['UUID'] || child['_attributes']['ID']
          const childTitle = child['Title']['_text']
          createNewLine(json.lines, { position: nextLinePosition, title: childTitle }, bookId)
          lineId = childId
          // return extractStoryLines(
          //   newJson,
          //   child['Children']['BinderItem'],
          //   bookTitle,
          //   bookId,
          //   isNewFile,
          //   relevantFiles,
          //   lineId
          // )
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
      const noLines = beatChildrenWithoutStoryLines.reduce((newJson, child, cardPositiin) => {
        console.log('newJSON', JSON.stringify(newJson.cards, null, 2))
        const cardId = child['_attributes']['UUID'] || child['_attributes']['ID']
        const cardTitle = child['Title']['_text']

        const matchFiles = getMatchedRelevantFiles(relevantFiles, cardId)
        const fileContents = { txtContent: createSlateParagraph(''), rtfContents: {} }
        if (matchFiles && matchFiles.length) {
          matchFiles.map((file) => {
            const isTxt = path.extname(file.filePath) == '.txt'
            const isRTF = path.extname(file.filePath) == '.rtf'
            if (isTxt && path.basename(file.filePath).endsWith('synopsis.txt')) {
              Object.assign(fileContents.txtContent, file.contents)
            } else if (isRTF) {
              if (path.basename(file.filePath).endsWith('notes.rtf')) {
                const rtfContents = getRTFContents(json.lines, file, lineId, bookId)
                Object.assign(fileContents.rtfContents, rtfContents)
                // rtfContents.lineId
                if (rtfContents.lineId > lineId) {
                  lineId = rtfContents.lineId
                }
              }
            }
          })
        } else if (!json.lines.length) {
          // if no plotline from rtf
          lineId = createNewLine(json.lines, { position: 0, title: i18n('Main Plot') }, bookId)
        }

        // console.log('cardId', cardId, 'cardTitle', cardTitle, 'lineId', lineId, 'beatId', beatId)

        return {
          ...newJson,
          cards: createNewCard(newJson.cards, {
            uuid: cardId,
            title: cardTitle || i18n('Scene {num}', { num: beatId + 1 }),
            position: cardPositiin,
            description: fileContents.txtContent,
            beatId,
            lineId,
          }),
        }
      }, withChildStoryLinesAdded)
      // console.log('no lines', JSON.stringify(noLines, null, 2))
      return noLines
    }, withNewBeats)

  return withNewCardsAndNewBeats
}

function getMatchedRelevantFiles(relevantFiles, childId) {
  return relevantFiles.filter(({ filePath }) => {
    const isVer_3_UUID = UUIDFolderRegEx.test(filePath)
    if (isVer_3_UUID) {
      return filePath.includes(childId)
    } else {
      return getVer_2_7_match(filePath, childId)
    }
  })
}

// Object, Array <[{}]>, int, int, int -> Object { nextLineId }
function getRTFContents(lines, rtf, lineId, bookId) {
  if (rtf.contents && rtf.contents.length) {
    let nextLineId = lineId
    const rtfContents = rtf.contents.flatMap((content) => {
      if (content.children && content.children.length) {
        return content.children.flatMap((childContent) => {
          // checks for plotlines in rtf
          if (childContent.text && Array.isArray(childContent.text)) {
            const plotlineValue = childContent.text.find((textList) =>
              textList.includes('Plotline: ')
            )
            if (plotlineValue) {
              const lineTitle = plotlineValue.split('Plotline: ').pop()
              const isPlotlineExist = lines.find((line) => line.title == lineTitle)
              if (!isPlotlineExist) {
                nextLineId = createNewLine(
                  lines,
                  {
                    position: nextLineId,
                    title: lineTitle,
                    color: nextColor(nextLineId),
                  },
                  bookId
                )
              }
              return { lineId: nextLineId }
            }
          }
        })
      }
    })
    return { lineId: rtfContents[0] && rtfContents[0].lineId ? rtfContents[0].lineId : nextLineId }
  }
}

function generateNotes(currentState, json, bookId, files, isNewFile) {
  json.map((item) => {
    const id = item['_attributes']['UUID'] || item['_attributes']['ID']
    const title = item['Title']['_text']
    const matchFiles = getMatchedRelevantFiles(files, id)
    if (matchFiles && matchFiles.length) {
      const content = getSectionRelevantFiles(matchFiles, bookId, true)
      const values = {
        title,
        bookIds: [bookId],
        content,
      }
      createNewNote(currentState.notes, values)
    }
  })
}

function generatePlaces(currentState, json, bookId, files, isNewFile) {
  json.map((item) => {
    const id = item['_attributes']['UUID'] || item['_attributes']['ID']
    const name = item['Title']['_text']
    const matchFiles = getMatchedRelevantFiles(files, id)
    if (matchFiles && matchFiles.length) {
      const content = getSectionRelevantFiles(matchFiles, bookId, true)
      const values = {
        name,
        bookIds: [bookId],
        content,
      }
      createNewPlace(currentState.places, values)
    }
  })
}

function generateCharacters(currentState, json, bookId, files, isNewFile) {
  json.map((item) => {
    const id = item['_attributes']['UUID'] || item['_attributes']['ID']
    const name = item['Title']['_text']
    const matchFile = getMatchedRelevantFiles(files, id)
    if (matchFile && matchFile.length) {
      const content = generateCustomAttribute(matchFile[0], currentState)
      const characterAttributes = content.reduce(
        (obj, item) => Object.assign(obj, { [Object.keys(item)[0]]: Object.values(item)[0] }),
        {}
      )

      let values = {
        name,
        bookIds: [bookId],
      }
      if (content && content.length) {
        values = {
          ...values,
          ...characterAttributes,
        }
      }

      createNewCharacter(currentState.characters, values)
      createCustomCharacterAttributes(currentState, content)
    }
  })
}

function getSectionRelevantFiles(matchFiles, bookId, isNotCharactersJson) {
  const fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
  return matchFiles.flatMap((file) => {
    const isTxt = path.extname(file.filePath) == '.txt'
    const isRTF = path.extname(file.filePath) == '.rtf'
    if (isNotCharactersJson) {
      if (file.contents && file.contents.length) {
        Object.assign(
          fileContents.rtfContents,
          file.contents.filter((i, idx) => idx > 0)
        )
        return fileContents.rtfContents
      }
    } else if (isTxt && path.basename(file.filePath).endsWith('synopsis.txt')) {
      Object.assign(fileContents.txtContent, file.contents)
      return fileContents.txtContent
    } else if (isRTF) {
      const rtfContents = getRTFContents([], file, '', bookId)
      Object.assign(fileContents.rtfContents, rtfContents)
      return fileContents.rtfContents
    }
  })
}

function generateCustomAttribute(fileContents) {
  const flatAttributes = fileContents.contents
    .flatMap((i) => {
      if (i.children && i.children.length) {
        return i.children.flatMap((c) => {
          if (c.text) {
            return c.text
          }
        })
      }
    })
    .filter((i, idx) => !!idx)

  return flatAttributes
    .map((item, index) => ({ [item]: flatAttributes[index + 1] }))
    .filter((item, idx) => idx % 2 == 0)
}

function createCustomCharacterAttributes(currentState, characterAttributes) {
  if (characterAttributes && characterAttributes.length) {
    const mappedCharAttributes = characterAttributes
      .map((attributes) => {
        const newAttr = Object.keys(attributes)[0]
        const attributeExists = currentState.customAttributes.characters.find(
          (attr) => attr.name == newAttr
        )

        if (!attributeExists || !currentState.customAttributes.characters.length) {
          return { name: newAttr, type: 'text' }
        }
      })
      .filter(Boolean)

    currentState.customAttributes.characters = [
      ...currentState.customAttributes.characters,
      ...mappedCharAttributes,
    ]
  }
}

export { ScrivenerImporter }
