import fs from 'fs'
import xml from 'xml-js'
import { t } from 'plottr_locales'
import path from 'path'
import { cloneDeep } from 'lodash'

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

  const notes = getSection(sectionsJSON, i18n('Notes')).filter((i) => i)
  const characters = getSection(sectionsJSON, i18n('Characters')).filter((i) => i)
  const places = getSection(sectionsJSON, i18n('Places')).filter((i) => i)

  return inMemoryFiles.then((files) => {
    const newJson = withStoryLineIfItExists(
      manuscript,
      currentState,
      bookTitle,
      bookId,
      isNewFile,
      files
    )

    if (notes && notes.length && notes[0]['Children'] && notes[0]['Children']['BinderItem']) {
      const notesBinderItem = Array.isArray(notes[0]['Children']['BinderItem'])
        ? notes[0]['Children']['BinderItem']
        : [notes[0]['Children']['BinderItem']]
      generateNotes(newJson, notesBinderItem, bookId, files, isNewFile)
    }

    if (places && places.length && places[0]['Children'] && places[0]['Children']['BinderItem']) {
      const placesBinderItem = Array.isArray(places[0]['Children']['BinderItem'])
        ? places[0]['Children']['BinderItem']
        : [places[0]['Children']['BinderItem']]
      generatePlaces(newJson, placesBinderItem, bookId, files, isNewFile)
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
      generateCharacters(newJson, charactersBinderItem, bookId, files, isNewFile)
    }
    return newJson
  })
}

const getSection = (sections, sectionName) => {
  return sections.map((n) => {
    // in ver2.7 Notes is usually Parent Folder and have subfolders of Notes, Characters and Places
    if (
      n['_attributes']['Type'] == 'ResearchFolder' &&
      n['Children'] &&
      n['Children']['BinderItem']
    ) {
      const BinderItemsArr = Array.isArray(n['Children']['BinderItem'])
        ? n['Children']['BinderItem']
        : [n['Children']['BinderItem']]
      const section = BinderItemsArr.find(
        (childBinderItem) =>
          childBinderItem['_attributes']['Type'] == 'Folder' &&
          childBinderItem['Title']['_text'] == sectionName
      )
      if (section) {
        return section
      }
    } else if (
      n['_attributes']['Type'] == 'Folder' &&
      n['Children'] &&
      n['Children']['BinderItem'] &&
      n['Title']['_text'] == sectionName
    ) {
      return n
    } else {
      // TODO other folder structure to find notes, chars and places
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
  const newPlace = Object.assign({}, defaultPlace, { id: nextPlaceId, ...values })
  currentPlaces.push(newPlace)
}

function createNewCharacter(currentCharacters, values) {
  const nextCharacterId = nextId(currentCharacters)
  const newCharacter = Object.assign({}, defaultCharacter, { id: nextCharacterId, ...values })
  currentCharacters.push(newCharacter)
}

function createNewCard(currentCards, values) {
  const nextCardId = nextId(currentCards)
  const newCard = Object.assign({}, defaultCard, { id: nextCardId, ...values })
  const cardExist = currentCards.find(
    (card) => card.id == newCard.id && card.title == newCard.title
  )
  if (!cardExist) {
    return [...currentCards, newCard]
  } else {
    return currentCards
  }
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

// Sting, string -> Bool
function getVer_2_7_matchedFiles(file, childId) {
  const fileName = path.basename(file)
  if (fileName.endsWith('_synopsis.txt') || fileName.endsWith('_notes.rtf')) {
    return fileName.split('_')[0] == childId
  } else {
    const uuid = fileName.replace('.rtf', '') || fileName.replace('.txt', '')
    return uuid == childId
  }
}

// String -> String
function getVer_2_7_matchName(file) {
  const fileName = path.basename(file)
  if (fileName.endsWith('_synopsis.txt') || fileName.endsWith('_notes.rtf')) {
    return fileName.split('_')[0]
  } else {
    const uuid = fileName.replace('.rtf', '') || fileName.replace('.txt', '')
    return uuid
  }
}

function nextPositionInLine(cards, lineId, beatId) {
  if (
    cards.length &&
    cards[cards.length - 1].beatId == beatId &&
    cards[cards.length - 1].lineId == lineId
  ) {
    return cards[cards.length - 1].positionWithinLine + 1
  } else {
    return 0
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
      return chapter['_attributes']['Type'] == 'Folder'
    })
    .reduce((acc, chapter, beatKey) => {
      const beatId = chapter['_attributes']['UUID'] || chapter['_attributes']['ID']
      const chaptersArray = Array.isArray(chapter['Children']['BinderItem'])
        ? chapter['Children']['BinderItem']
        : [chapter['Children']['BinderItem']]
      const beatChildrenWithStoryLines = chaptersArray.filter((child) => {
        return child['_attributes']['Type'] == 'Folder'
      })
      // if has 1 child, json parser converted it an object

      const withChildStoryLinesAdded = beatChildrenWithStoryLines.reduce(
        (newJsonWithBeats, child, nextLinePosition) => {
          const childId = child['_attributes']['UUID'] || child['_attributes']['ID']
          const childTitle = child['Title']['_text']

          createNewLine(
            newJsonWithBeats.lines,
            {
              title: childTitle,
              color: nextColor(newJsonWithBeats.lines.length),
              id: childId,
            },
            bookId
          )

          if (child['_attributes']['Type'] == 'Folder') {
            const withPlotlineSubFolderChildrenArray = Array.isArray(
              child['Children']['BinderItem']
            )
              ? child['Children']['BinderItem']
              : [child['Children']['BinderItem']]

            let fileContents = {
              txtContent: createSlateParagraph(''),
              rtfContents: {
                lineId: childId,
              },
            }

            return withPlotlineSubFolderChildrenArray.reduce(
              (jsonWithPlotlineSubfolderCards, subfolder, idx) => {
                const cardId = subfolder['_attributes']['UUID'] || subfolder['_attributes']['ID']
                const cardTitle = subfolder['Title']['_text']

                const matchFiles = getMatchedRelevantFiles(relevantFiles, cardId)
                if (matchFiles && matchFiles.length) {
                  const mappedFiles = mapMatchedFiles(
                    newJsonWithBeats,
                    matchFiles,
                    fileContents,
                    bookId
                  )
                  fileContents = {
                    rtfContents: mappedFiles.rtfContents,
                    txtContent: createSlateEditor(mappedFiles.txtContent),
                  }
                }
                const descriptionArr = Array.isArray(fileContents.txtContent)
                  ? fileContents.txtContent
                  : [fileContents.txtContent]

                return {
                  ...jsonWithPlotlineSubfolderCards,
                  cards: createNewCard(jsonWithPlotlineSubfolderCards.cards, {
                    id: cardId,
                    title: cardTitle || i18n('Scene {num}', { num: beatId + 1 }),
                    positionWithinLine: nextPositionInLine(
                      jsonWithPlotlineSubfolderCards.cards,
                      lineId,
                      beatId
                    ),
                    description: descriptionArr,
                    positionInBeat: beatId,
                    beatId,
                    lineId: childId,
                    bookId,
                  }),
                }
              },
              newJsonWithBeats
            )
          }
          return newJsonWithBeats
        },
        acc
      )

      const beatChildrenWithoutStoryLines = chaptersArray.filter((child) => {
        return child['_attributes']['Type'] == 'Text' && child['Title']['_text']
      })

      const beatChildrenWithoutStoryLinesArr = Array.isArray(beatChildrenWithoutStoryLines)
        ? beatChildrenWithoutStoryLines
        : [beatChildrenWithoutStoryLines]

      return beatChildrenWithoutStoryLinesArr.reduce((newJson, child, key) => {
        const cardId = child['_attributes']['UUID'] || child['_attributes']['ID']
        const cardTitle = child['Title']['_text']

        // files same filename prefix with the cards (v2.7)
        // same filename parent directory (v3)
        const matchFiles = getMatchedRelevantFiles(relevantFiles, cardId)
        let fileContents = { txtContent: createSlateParagraph(''), rtfContents: { lineId: 1 } }
        if (matchFiles && matchFiles.length) {
          const mappedFiles = mapMatchedFiles(newJson, matchFiles, fileContents, bookId)
          fileContents = {
            rtfContents: mappedFiles.rtfContents,
            txtContent: createSlateEditor(mappedFiles.txtContent),
          }
        } else if (!newJson.lines.length) {
          // if no plotline from rtf
          createNewLine(newJson.lines, { position: 0, title: i18n('Main Plot') }, bookId)
        }

        const descriptionArr = Array.isArray(fileContents.txtContent)
          ? fileContents.txtContent
          : [fileContents.txtContent]

        return {
          ...newJson,
          cards: createNewCard(newJson.cards, {
            id: cardId,
            title: cardTitle || i18n('Scene {num}', { num: beatId + 1 }),
            positionWithinLine: nextPositionInLine(newJson.cards, lineId, beatId),
            description: descriptionArr,
            positionInBeat: beatId,
            beatId,
            lineId: fileContents.rtfContents.lineId,
            bookId,
          }),
        }
      }, withChildStoryLinesAdded)
    }, withNewBeats)

  return withNewCardsAndNewBeats
}
// Object, Array <any>, Object, Int -> Object { txtContent: {}, rtfContent: {} }
function mapMatchedFiles(newJson, matchFiles, fileContents, bookId, isSection) {
  matchFiles.forEach((file) => {
    const isTxt = path.extname(file.filePath) == '.txt'
    const isRTF = path.extname(file.filePath) == '.rtf'
    const matchedFileId =
      (Array.isArray(file.filePath.match(UUIDFolderRegEx))
        ? file.filePath.match(UUIDFolderRegEx)[0]
        : file.filePath.match(UUIDFolderRegEx)) || getVer_2_7_matchName(file.filePath)
    if (!isRTF && !newJson.lines.length) {
      // TODO: check if rtf on manuscript can contain other rtfs
      // other than the rtf files created by Plottr on `notes.rtf`
      fileContents.rtfContents.lineId = createNewLine(
        newJson.lines,
        { position: 0, title: i18n('Main Plot') },
        bookId
      )
    }
    if (!matchedFileId && !isSection) {
      fileContents.rtfContents.lineId = 1
    }
    if (isTxt && path.basename(file.filePath).endsWith('synopsis.txt')) {
      Object.assign(fileContents.txtContent, file.contents)
    }
    if (isRTF) {
      if (path.basename(file.filePath).endsWith('notes.rtf')) {
        const newRTFContent = getRTFContents(newJson.lines, file, matchedFileId, bookId)
        Object.assign(fileContents.rtfContents, newRTFContent)
        if (newRTFContent.lineId) {
          fileContents.rtfContents.lineId = Array.isArray(newRTFContent.lineId)
            ? newRTFContent.lineId[0]
            : newRTFContent.lineId
        } else if (!newJson.lines.length) {
          fileContents.rtfContents.lineId = createNewLine(
            newJson.lines,
            { position: 0, title: i18n('Main Plot') },
            bookId
          )
        }
      } else {
        const newRTFContent = getRTFContents(newJson.lines, file, matchedFileId, bookId, isSection)
        Object.assign(fileContents.rtfContents, newRTFContent)
      }
    }
  })
  return fileContents
}

function getMatchedRelevantFiles(relevantFiles, childId) {
  return relevantFiles.filter(({ filePath }) => {
    const isVer_3_UUID = UUIDFolderRegEx.test(filePath)
    if (isVer_3_UUID) {
      return filePath.includes(childId)
    } else {
      return getVer_2_7_matchedFiles(filePath, childId)
    }
  })
}

function createSlateEditor(value) {
  return {
    type: 'paragraph',
    children: value && value.children ? value.children : [{ text: '' }],
  }
}

// Object, Array <[{}]>, int, int, int -> Object { nextLineId }
function getRTFContents(lines, rtf, matchId, bookId, isSection) {
  let nextLineId = Array.isArray(matchId) ? matchId[0] : matchId
  if (!isSection && rtf.contents && rtf.contents.length) {
    const rtfContents = rtf.contents.flatMap((content) => {
      if (content.children && content.children.length) {
        return content.children.flatMap((childContent) => {
          // checks for plotlines in rtf
          if (childContent.text) {
            if (childContent.text.includes('Plotline: ')) {
              const lineTitle = childContent.text.split('Plotline: ').pop()
              const existingPlotline = lines.find((line) => line.title == lineTitle)
              if (!existingPlotline) {
                createNewLine(
                  lines,
                  {
                    id: nextLineId,
                    title: lineTitle,
                    color: nextColor(lines.length),
                  },
                  bookId
                )
              } else {
                nextLineId = existingPlotline.id
              }
              return { lineId: nextLineId }
            } else {
              // return default lineId if no plotline found
              return { lineId: 1 }
            }
          }
        })
      }
    })
    return { lineId: rtfContents[0] && rtfContents[0].lineId ? rtfContents[0].lineId : 1 }
  } else if (isSection && rtf.contents && rtf.contents.length) {
    return rtf.contents
  }
}

function generateNotes(currentState, json, bookId, files, isNewFile) {
  json.forEach((item, key) => {
    const id = item['_attributes']['UUID'] || item['_attributes']['ID']
    const title =
      item['Title'] && item['Title']['_text']
        ? item['Title']['_text']
        : t('Note {key}', { key: key + 1 })
    const children = item['Children']
    const matchFiles = getMatchedRelevantFiles(files, id)
    if (matchFiles && matchFiles.length) {
      let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
      const mappedFiles = mapMatchedFiles(currentState, matchFiles, fileContents, bookId, true)
      fileContents = {
        rtfContents: mappedFiles.rtfContents,
        txtContent: createSlateEditor(mappedFiles.txtContent),
      }
      const values = {
        title,
        bookIds: [bookId],
        content: fileContents.rtfContents,
      }
      createNewNote(currentState.notes, values)
    } else if (children['BinderItem']) {
      const binderItemsArr = Array.isArray(children['BinderItem'])
        ? children['BinderItem']
        : [children['BinderItem']]

      generateNotes(currentState, binderItemsArr, bookId, files)
    }
  })
}

function generatePlaces(currentState, json, bookId, files, isNewFile) {
  json.forEach((item, key) => {
    const id = item['_attributes']['UUID'] || item['_attributes']['ID']
    const name =
      item['Title'] && item['Title']['_text']
        ? item['Title']['_text']
        : t('Place {key}', { key: key + 1 })
    const children = item['Children']
    const matchFiles = getMatchedRelevantFiles(files, id)
    if (matchFiles && matchFiles.length) {
      let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
      const mappedFiles = mapMatchedFiles(currentState, matchFiles, fileContents, bookId, true)
      fileContents = {
        rtfContents: mappedFiles.rtfContents,
        txtContent: createSlateEditor(mappedFiles.txtContent),
      }
      const content = generateCustomAttribute({ contents: fileContents.rtfContents }, name)
      const customAttributes = content
        // remove three dots placeholder if key
        .filter((item) => Object.keys(item)[0] != '...')
        .reduce(
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
          ...customAttributes,
        }
      }
      createNewPlace(currentState.places, values)
      createCustomAttributes(currentState, content, 'places')
    } else if (children['BinderItem']) {
      // for the manuscript we assign the parent folder of the card as the line
      // we could assign the parent folder as the category
      // WDYT @ed @cameron ?
      const binderItemsArr = Array.isArray(children['BinderItem'])
        ? children['BinderItem']
        : [children['BinderItem']]

      generatePlaces(currentState, binderItemsArr, bookId, files)
    }
  })
}

function generateCharacters(currentState, json, bookId, files, isNewFile) {
  json.forEach((item, key) => {
    const id = item['_attributes']['UUID'] || item['_attributes']['ID']
    const name =
      item['Title'] && item['Title']['_text']
        ? item['Title']['_text']
        : t('Character {key}', { key: key + 1 })
    const children = item['Children']
    const matchFile = getMatchedRelevantFiles(files, id)
    if (matchFile && matchFile.length) {
      const content = generateCustomAttribute(matchFile[0], name)

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
      createCustomAttributes(currentState, content, 'characters')
    } else if (children['BinderItem']) {
      const binderItemsArr = Array.isArray(children['BinderItem'])
        ? children['BinderItem']
        : [children['BinderItem']]

      generateCharacters(currentState, binderItemsArr, bookId, files)
    }
  })
}

function generateCustomAttribute(fileContents, name) {
  const fileContentsArr = Array.isArray(fileContents.contents)
    ? fileContents.contents
    : [fileContents.contents]
  const flatAttributes = fileContentsArr
    .flatMap((i, idx) => {
      if (i.children && i.children.length) {
        return i.children.filter(
          (child, idx) => child.text.toLowerCase().trim() != name.toLowerCase().trim()
        )
      }
    })
    .filter((item) => Object.entries(item).length)

  return flatAttributes
    .map((item, index) => ({
      [item.text]: flatAttributes[index + 1] ? flatAttributes[index + 1].text : '',
    }))
    .filter((item, index) => index % 2 == 0)
}

function createCustomAttributes(currentState, characterAttributes, section) {
  if (characterAttributes && characterAttributes.length) {
    const mappedAttributes = characterAttributes
      .map((attributes) => {
        const newAttr = Object.keys(attributes)[0]
        const attributeExists = currentState.customAttributes[section].find(
          (attr) => attr.name == newAttr
        )

        if (!attributeExists || !currentState.customAttributes[section].length) {
          return { name: newAttr, type: 'text' }
        }
      })
      .filter(Boolean)

    currentState.customAttributes[section] = [
      ...currentState.customAttributes[section],
      ...mappedAttributes,
    ]
  }
}

export { ScrivenerImporter }
