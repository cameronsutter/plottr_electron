import fs from 'fs'
import xml from 'xml-js'
import { t } from 'plottr_locales'
import path from 'path'
import { cloneDeep, keys, values } from 'lodash'

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
const defaultTag = initialState.tag
const defaultCategory = initialState.category

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
    return {
      ...newJson,
      file: {
        ...newJson.file,
        lastOpened: new Date(),
      },
    }
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
  if (manuscript['Children'] && manuscript['Children']['BinderItem']) {
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

function createNewCategory(currentCategories, name) {
  const nextCategoryId = nextId(currentCategories)
  const categoryExist = currentCategories.find(
    (category) => category.name.toLowerCase().trim() == name.toLowerCase().trim()
  )
  if (!categoryExist) {
    const newCategory = Object.assign({}, defaultCategory, { id: nextCategoryId, name })
    currentCategories.push(newCategory)
    return nextCategoryId
  }
  return categoryExist.id
}

function createNewTag(currentTags, title) {
  const nextTagId = nextId(currentTags)
  const tagExist = currentTags.find(
    (tag) => tag.title.toLowerCase().trim() == title.toLowerCase().trim()
  )
  if (!tagExist) {
    const newTag = Object.assign({}, defaultTag, { id: nextTagId, title })
    currentTags.push(newTag)
    return nextTagId
  }
  return tagExist.id
}

function createSlateParagraph(value) {
  if (Array.isArray(value)) {
    return {
      type: 'paragraph',
      children: value.flatMap((item) => item || [{ text: '' }]),
    }
  }
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
  const chapters = Array.isArray(storyLineNode['Children']['BinderItem'])
    ? storyLineNode['Children']['BinderItem']
    : [storyLineNode['Children']['BinderItem']]
  let lineId = currentLineId || 1

  const hasChapterFolder = chapters.find((chapter) => chapter['_attributes']['Type'] == 'Folder')

  const withNewBeats = chapters.reduce((acc, chapter, beatKey) => {
    const id = chapter['_attributes']['UUID'] || chapter['_attributes']['ID']
    const title = hasChapterFolder ? chapter['Title']['_text'] : 'Beat 1'
    const position = beatKey

    // Don't create more than 1 beat if `hasChapterFolder` is false
    const newBeats =
      hasChapterFolder || !beatKey ? createNewBeat(acc, { id, title, position }, bookId) : null
    if (newBeats) {
      return {
        ...acc,
        beats: newBeats,
      }
    }
    return {
      ...acc,
    }
  }, json)

  const withNewCardsAndNewBeats = chapters
    .filter((chapter) => {
      if (hasChapterFolder) {
        return chapter['_attributes']['Type'] == 'Folder'
      } else {
        // Data here will be used as card data
        return chapter['_attributes']['Type'] == 'Text'
      }
    })
    .reduce((acc, chapter, beatKey) => {
      const beatId = chapter['_attributes']['UUID'] || chapter['_attributes']['ID']

      const chaptersArray =
        hasChapterFolder && Array.isArray(chapter['Children']['BinderItem'])
          ? chapter['Children']['BinderItem']
          : !!hasChapterFolder && [chapter['Children']['BinderItem']]
      const beatChildrenWithStoryLines = hasChapterFolder
        ? chaptersArray.filter((child) => {
            return child['_attributes']['Type'] == 'Folder'
          })
        : []

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
                    txtContent: createSlateEditor(
                      mappedFiles.rtfContents && mappedFiles.rtfContents.contents
                        ? mappedFiles.rtfContents.contents
                        : mappedFiles.txtContent
                    ),
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

      const beatChildrenWithoutStoryLines = hasChapterFolder
        ? chaptersArray.filter((child) => {
            return child['_attributes']['Type'] == 'Text'
          })
        : // if `hasChapterFolder` is false, treat all children as card
          chapters.filter((child) => {
            return child['_attributes']['Type'] == 'Text'
          })

      const beatChildrenWithoutStoryLinesArr = Array.isArray(beatChildrenWithoutStoryLines)
        ? beatChildrenWithoutStoryLines
        : [beatChildrenWithoutStoryLines]

      return beatChildrenWithoutStoryLinesArr.reduce((newJson, child, key) => {
        const cardId = child['_attributes']['UUID'] || child['_attributes']['ID']
        const cardTitle = child['Title'] && child['Title']['_text'] ? child['Title']['_text'] : ''

        // Scrivener v2_7
        // card content is same filename, prefix with (number/string) the card ID
        // e.g. 1234_notes.rtf, 123_synopsis.txt

        // Scrivener 3
        // card content is same filename of (UUIDFolderRegEx pattern) parent directory,
        // followed by notes, synopsis or just uuid
        // e.g. 9A337676-2163-499F-9CBE-A6F4BC300B5B/notes.rtf, 9A337676-2163-499F-9CBE-A6F4BC300B5B/synopsis.txt
        const matchFiles = getMatchedRelevantFiles(relevantFiles, cardId)
        let fileContents = { txtContent: createSlateParagraph(''), rtfContents: { lineId: 1 } }
        if (matchFiles && matchFiles.length) {
          const mappedFiles = mapMatchedFiles(newJson, matchFiles, fileContents, bookId)
          fileContents = {
            rtfContents: mappedFiles.rtfContents,
            txtContent: createSlateEditor(
              mappedFiles.rtfContents && mappedFiles.rtfContents.contents
                ? mappedFiles.rtfContents.contents
                : mappedFiles.txtContent
            ),
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
            title: cardTitle,
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
      const synopsisContent = file.contents.children.map((content) => {
        // Remove description label in synopsis.txt
        content['text'] = content.text.startsWith('Description\r\n\r\n')
          ? content.text.replace(/^Description\r\n\r\n/, '')
          : content.text.startsWith('Description\r\n\r')
          ? content.text.replace(/^Description\r\n\r/, '')
          : content.text.startsWith('Description\n\n')
          ? content.text.replace(/^Description\n\n/, '')
          : content.text.startsWith('Description\r\n')
          ? content.text.replace(/^Description\r\n/, '')
          : content.text.text
          ? ''
          : content.text

        return content
      })
      file.contents.children = synopsisContent
      Object.assign(fileContents.txtContent, file.contents)
    }
    if (isRTF) {
      if (path.basename(file.filePath).endsWith('notes.rtf')) {
        const newRTFContent = getRTFContents(newJson.lines, file, matchedFileId, bookId)
        Object.assign(fileContents.rtfContents, newRTFContent)

        // if has plotline
        if (newRTFContent.lineId) {
          fileContents.rtfContents.lineId = Array.isArray(newRTFContent.lineId)
            ? newRTFContent.lineId[0]
            : newRTFContent.lineId
        } else if (!newJson.lines.length) {
          // if no plotline and lines array is empty, create `Main Plot`
          fileContents.rtfContents.lineId = createNewLine(
            newJson.lines,
            { position: 0, title: i18n('Main Plot') },
            bookId
          )
        }
        // notes.rtf has content other than plotline
        // sections (chars/places/notes) are restricted to use the notes.rtf values
        if (newRTFContent.contents && !isSection) {
          fileContents.rtfContents.contents = newRTFContent.contents
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
  if (Array.isArray(value)) {
    return {
      type: 'paragraph',
      children: value.flatMap((item) => createSlateParagraph(item.children)),
    }
  }
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
            if (
              childContent.text.includes('Plotline: ') ||
              childContent.text.includes('plotline: ')
            ) {
              const lineTitle = childContent.text.includes('Plotline: ')
                ? childContent.text.split('Plotline: ').pop()
                : childContent.text.split('plotline: ').pop()
              const existingPlotline = lines.find(
                (line) => line.title.toLowerCase().trim() == lineTitle.toLowerCase().trim()
              )
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
    const hasPlotline = !!rtfContents[0].lineId
    if (rtf.contents.length > 1 && hasPlotline) {
      // exclude the index[0] / plotline from the contents
      const filteredContents = rtf.contents.filter((item, index) => index)
      return {
        contents: filteredContents,
        lineId: hasPlotline ? rtfContents[0].lineId : 1,
      }
    }
    return {
      lineId: hasPlotline ? rtfContents[0].lineId : 1,
    }
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
      const note = {
        title,
        bookIds: [bookId],
        content: fileContents.rtfContents,
      }
      createNewNote(currentState.notes, note)
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
      const content = generateCustomAttribute({ contents: fileContents.rtfContents }, 'place', name)
      const customAttributes = content
        // ASSUMPTION: items from `generateCustomAttribute` are single-key objects with a name
        // that corresponds to an entity's property
        // and a value which corresponds to that property's value.

        // remove three dots placeholder if key
        .filter((item) => keys(item)[0] != '...')
        .map((item) => {
          const attrKey = keys(item)[0]
          const attrValue = values(item)[0]

          if (isATag(attrKey)) {
            const tagIds = generateTagIds(currentState, attrValue)
            return { tags: tagIds }
          } else {
            return strippedDefaultAttributes(currentState, 'places', attrKey, attrValue || '')
          }
        })
        .reduce((obj, item) => Object.assign(obj, { [keys(item)[0]]: values(item)[0] }), {})

      let place = {
        name,
        bookIds: [bookId],
      }
      if (content && content.length) {
        place = {
          ...place,
          ...customAttributes,
        }
      }
      createNewPlace(currentState.places, place)
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
      const content = generateCustomAttribute(matchFile[0], 'character', name)

      const characterAttributes = content
        // ASSUMPTION: items from `generateCustomAttribute` are single-key objects with a name
        // that corresponds to an entity's property
        // and a value which corresponds to that property's value.

        // remove three dots placeholder if key
        .filter((item) => keys(item)[0] != '...')
        .map((item) => {
          const attrKey = keys(item)[0]
          const attrValue = values(item)[0]

          if (isATag(attrKey)) {
            const tagIds = generateTagIds(currentState, attrValue)
            return { tags: tagIds }
          } else {
            return strippedDefaultAttributes(currentState, 'characters', attrKey, attrValue || '')
          }
        })
        .reduce((obj, item) => Object.assign(obj, { [keys(item)[0]]: values(item)[0] }), {})

      let character = {
        name,
        bookIds: [bookId],
      }
      if (content && content.length) {
        character = {
          ...character,
          ...characterAttributes,
        }
      }

      createNewCharacter(currentState.characters, character)
      createCustomAttributes(currentState, content, 'characters')
    } else if (children['BinderItem']) {
      const binderItemsArr = Array.isArray(children['BinderItem'])
        ? children['BinderItem']
        : [children['BinderItem']]

      generateCharacters(currentState, binderItemsArr, bookId, files)
    }
  })
}

// Object, String, String, String -> Object
function strippedDefaultAttributes(currentState, section, key, value) {
  const strippedKey = key.toLowerCase().trim()
  if (strippedKey == 'description') {
    return {
      description: value,
    }
  } else if (strippedKey == 'notes') {
    return {
      notes: value,
    }
  } else if (strippedKey == 'category') {
    return {
      categoryId: createNewCategory(currentState.categories[section], value),
    }
  }
  return {
    [key]: value,
  }
}

function isATag(objKey) {
  return objKey.toLowerCase().trim() == 'tags'
}

// String -> Bool
function isNotExcludedAttribute(attribute) {
  const excludedAttributes = ['tags', 'description', 'notes', 'category', '...']
  const strippedAttribute = attribute.toLowerCase().trim()
  return !excludedAttributes.includes(strippedAttribute)
}

// Object, Object, String -> [Object]
function generateCustomAttribute(fileContents, section, name) {
  const fileContentsArr = Array.isArray(fileContents.contents)
    ? fileContents.contents
    : [fileContents.contents]
  const flatAttributes = fileContentsArr
    .flatMap((i, idx) => {
      if (i.children && i.children.length) {
        return i.children.filter((child, idx) => {
          const strippedText = child.text.toLowerCase().replace(`${section}:`, '').trim()
          const isNameAttr = strippedText == name.toLowerCase().trim()
          return !isNameAttr
        })
      }
    })
    .filter(Boolean)

  const flattenAndMergedAttributes = flatAttributes.reduce((acc, curr, idx) => {
    const isConsecutiveLongAttributes = acc.find(
      (obj) =>
        obj.text &&
        obj.text.length &&
        obj.text.length > 40 &&
        flatAttributes[idx - 1] &&
        flatAttributes[idx - 1].text &&
        flatAttributes[idx - 1].text.length > 40 &&
        curr.text.length &&
        curr.text.length > 40
    )
    if (!isConsecutiveLongAttributes) {
      acc.push(curr)
    } else {
      // Merge 2 consecutive item/attributes text if both attributes is more than 40 characters
      isConsecutiveLongAttributes['text'] = `${isConsecutiveLongAttributes['text']} \n ${curr.text}`
    }
    return acc
  }, [])

  return flattenAndMergedAttributes
    .map((item, index) => ({
      [item.text]: flattenAndMergedAttributes[index + 1]
        ? flattenAndMergedAttributes[index + 1].text
        : '',
    }))
    .filter((item, index) => index % 2 == 0)
}

// Object, String -> [Any]
function generateTagIds(currentState, stringOfTags) {
  const splittedTags = stringOfTags.includes(',') ? stringOfTags.split(',') : [stringOfTags]
  return splittedTags.map((tag) => {
    return createNewTag(currentState.tags, tag)
  })
}

function createCustomAttributes(currentState, attributes, section) {
  if (attributes && attributes.length) {
    const mappedAttributes = attributes
      .map((attributes) => {
        const newAttr = keys(attributes)[0]
        const attributeExists = currentState.customAttributes[section].find(
          (attr) => attr.name.toLowerCase().trim() == newAttr.toLowerCase().trim()
        )

        if (
          (!currentState.customAttributes[section].length || !attributeExists) &&
          isNotExcludedAttribute(newAttr)
        ) {
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

export default ScrivenerImporter
