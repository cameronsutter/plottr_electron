import xml from 'xml-js'
import fs from 'fs'
import { t as i18n } from 'plottr_locales'
import { cloneDeep, keyBy, groupBy } from 'lodash'
import { newIds, helpers, lineColors, initialState } from 'pltr/v2'

const { nextColor } = lineColors
const defaultBook = initialState.book
const defaultNote = initialState.note
const defaultCharacter = initialState.character
const defaultCard = initialState.card
const defaultBeat = initialState.beat
const defaultLine = initialState.line

const { nextId, objectId } = newIds
const {
  lists: { nextPositionInBook },
} = helpers

export default function Importer(path, isNewFile, state) {
  const importedXML = fs.readFileSync(path, 'utf-8')
  const currentState = cloneDeep(state)

  const json = JSON.parse(xml.xml2json(importedXML, { compact: true, spaces: 2 }))

  // create a new book (if not new file)
  let bookId = 1
  if (!isNewFile) {
    bookId = createNewBook(currentState.books)
  }

  const bookTitle = bookAttributes(currentState.books, json, bookId)

  storyLine(currentState, json, bookTitle, bookId, isNewFile)
  synopsis(currentState, json, bookTitle, bookId, isNewFile)
  characters(currentState, json, bookId)
  cards(currentState, json, bookId)

  return currentState
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

function createNewBeat(currentBeats, values, bookId) {
  const nextBeatId = nextId(currentBeats)
  const position = nextPositionInBook(currentBeats, bookId)
  const newBeat = Object.assign({}, defaultBeat, {
    id: nextBeatId,
    position,
    bookId,
    ...values,
  })
  currentBeats.push(newBeat)
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

function bookAttributes(currentBooks, json, bookId) {
  // title of the book (with subtitle)
  const titleAttr = json['GContainer']['GString'].find((n) => n['_attributes']['name'] == 'title')
  // const subTitleAttr = json['GContainer']['GString'].find(n => n['_attributes']['name'] == 'subtitle')
  if (titleAttr) {
    let title = titleAttr['_attributes']['value']
    // if (subTitleAttr) title = `${title}: ${subTitleAttr['_attributes']['value']}`
    currentBooks[`${bookId}`].title = title
  }

  // genre
  const genreAttr = json['GContainer']['GString'].find((n) => n['_attributes']['name'] == 'genre')
  if (genreAttr) {
    currentBooks[`${bookId}`].genre = genreAttr['_attributes']['value']
  }

  // target reader -> theme
  const targetReaderAttr = json['GContainer']['GString'].find(
    (n) => n['_attributes']['name'] == 'targetReader'
  )
  if (targetReaderAttr) {
    currentBooks[`${bookId}`].theme = targetReaderAttr['_attributes']['value'].replace(/\n/g, ' ')
  }

  // storyLine -> premise
  const storyLineNode = json['GContainer']['GContainer'].find(
    (n) => n['_attributes']['name'] == 'storyLine'
  )
  if (storyLineNode && storyLineNode['GString']) {
    const storyLineAttr = storyLineNode['GString'].find(
      (n) => n['_attributes']['name'] == 'sentence'
    )
    if (storyLineAttr) {
      currentBooks[`${bookId}`].premise = storyLineAttr['_attributes']['value']
    }
  }

  // TODO: projected word counts -> in a note
  return titleAttr['_attributes']['value']
}

function storyLine(currentState, json, bookTitle, bookId, isNewFile) {
  const storyLineNode = json['GContainer']['GContainer'].find(
    (n) => n['_attributes']['name'] == 'storyLine'
  )
  if (storyLineNode && storyLineNode['GString']) {
    // storyLine sentence -> note
    let storyLineAttr = storyLineNode['GString'].find((n) => n['_attributes']['name'] == 'sentence')
    if (storyLineAttr) {
      createNewNote(currentState.notes, {
        title: isNewFile
          ? i18n('One Sentence Summary')
          : `[${bookTitle}] ${i18n('One Sentence Summary')}`,
        bookIds: [bookId],
        content: createSlateEditor([storyLineAttr['_attributes']['value']]),
      })
    }
    // storyLine paragraph -> note
    storyLineAttr = storyLineNode['GString'].find((n) => n['_attributes']['name'] == 'paragraph')
    if (storyLineAttr) {
      createNewNote(currentState.notes, {
        title: isNewFile
          ? i18n('One Paragraph Summary')
          : `[${bookTitle}] ${i18n('One Paragraph Summary')}`,
        bookIds: [bookId],
        content: createSlateEditor([storyLineAttr['_attributes']['value']]),
      })
    }
  }
}

function synopsis(currentState, json, bookTitle, bookId, isNewFile) {
  let synopsisNode = json['GContainer']['GContainer'].find(
    (n) => n['_attributes']['name'] == 'shortSynopsis'
  )
  if (synopsisNode && synopsisNode['GString']) {
    // short synopsis -> in a note (each line of it as a slate paragraph)
    const shortParagraphs = synopsisParagraphs(synopsisNode['GString'])
    if (shortParagraphs && shortParagraphs.length) {
      createNewNote(currentState.notes, {
        title: isNewFile ? i18n('Short Synopsis') : `[${bookTitle}] ${i18n('Short Synopsis')}`,
        bookIds: [bookId],
        content: createSlateEditor(shortParagraphs),
      })
    }
  }
  synopsisNode = json['GContainer']['GContainer'].find(
    (n) => n['_attributes']['name'] == 'longSynopsis'
  )
  if (synopsisNode && synopsisNode['GString']) {
    // long synopsis -> in a note (each line of it as a slate paragraph)
    const longParagraphs = synopsisParagraphs(synopsisNode['GString'])
    if (longParagraphs && longParagraphs.length) {
      createNewNote(currentState.notes, {
        title: isNewFile ? i18n('Long Synopsis') : `[${bookTitle}] ${i18n('Long Synopsis')}`,
        bookIds: [bookId],
        content: createSlateEditor(longParagraphs),
      })
    }
  }
}

function synopsisParagraphs(GStringNode) {
  let paragraphs = []
  if (Array.isArray(GStringNode)) {
    paragraphs = GStringNode.map((n) => n['_attributes']['value'])
  } else {
    paragraphs.push(GStringNode['_attributes']['value'])
  }
  return paragraphs
}

function characters(currentState, json, bookId) {
  const characterListNode = json['GContainer']['GContainer'].find(
    (n) => n['_attributes']['name'] == 'characterInfoList'
  )
  if (
    characterListNode &&
    characterListNode['GContainer'] &&
    characterListNode['GContainer'].length
  ) {
    let newCustomAttrs = []
    characterListNode['GContainer'].forEach((chNode) => {
      if (chNode['GString'] && chNode['GString'].length) {
        let values = chNode['GString'].reduce((acc, attr) => {
          // get the right attr
          const attrName = characterAttrMapping[attr['_attributes']['name']] || 'notes'
          const val = attr['_attributes']['value']
          if (attrName == 'name') {
            acc['name'] = val
          } else {
            if (['paragraph', 'synopsis'].includes(attr['_attributes']['name'])) {
              let trimmedText = val.replace(/\n\n/g, '\n').replace(/\t/g, '')
              const parts = trimmedText.split('\n')
              acc[attrName] = createSlateEditor(parts)
            } else {
              acc[attrName] = val.replace(/\n/g, ' ')
            }
            // also create a custom attribute
            newCustomAttrs.push(attrName)
          }
          return acc
        }, {})
        values['bookIds'] = [bookId]
        createNewCharacter(currentState.characters, values)
      }
    })
    createCustomCharacterAttributes(currentState, newCustomAttrs)
  }
}

function createCustomCharacterAttributes(currentState, newCustomAttrs) {
  // get names of current ones
  const currentListByName = keyBy(currentState.customAttributes.characters, 'name')
  // add new ones if they don't already exist
  const customAttrs = characterAttrOrder.reduce((acc, attr) => {
    if (newCustomAttrs.includes(attr)) {
      let type = 'text'
      if (['One-Paragraph Summary', 'Character Synopsis'].includes(attr)) type = 'paragraph'
      if (!currentListByName[attr]) acc.push({ name: attr, type: type })
    }
    return acc
  }, [])
  currentState.customAttributes.characters = [
    ...currentState.customAttributes.characters,
    ...customAttrs,
  ]
}

function cards(currentState, json, bookId) {
  const sceneListNode = json['GContainer']['GContainer'].find(
    (n) => n['_attributes']['name'] == 'sceneList'
  )
  if (sceneListNode && sceneListNode['GContainer'] && sceneListNode['GContainer'].length) {
    const lineId = createNewLine(
      currentState.lines,
      { position: 0, title: i18n('Main Plot') },
      bookId
    )
    const scenesByBeat = groupBy(sceneListNode['GContainer'], (scene) => {
      // 'chapter' is a snowflake thing
      const node = scene['GInteger'].find((n) => n['_attributes']['name'] == 'chapter')
      if (node) return node['_attributes']['value']
      return '1'
    })
    const beatNumbers = Object.keys(scenesByBeat)
    const scenesByBeatByCharacter = beatNumbers.reduce((acc, num) => {
      acc[num] = groupBy(scenesByBeat[num], (scene) => {
        const node = scene['GInteger'].find((n) => n['_attributes']['name'] == 'povName')
        if (node) return node['_attributes']['value']
        return ''
      })
      return acc
    }, {})

    // idMap is Snowflake id to Plottr id
    const idMap = beatNumbers.reduce((acc, id) => {
      acc[id] = createNewBeat(currentState.beats, { position: Number(id) - 1 }, bookId)
      return acc
    }, {})

    let createdScenesByBeat = {}
    let createdScenesByBeatByCharacter = {}
    let linesByTitle = {}
    let nextLinePosition = 1

    sceneListNode['GContainer'].forEach((sNode) => {
      // each one is a card in a beat
      let beatId = null
      let characterName = ''
      let sentence = ''
      let wordCountExpected = 0

      let paragraphsByName = {}
      function addParagraphs(node) {
        const name = node['_attributes']['name']
        const value = node['_attributes']['value']
        // 'chapter' is a snowflake thing
        if (name == 'chapter') {
          beatId = value
        } else if (name == 'povName') {
          if (value) characterName = value
        } else if (name == 'wordCountExpected') {
          if (value) wordCountExpected = value
        } else {
          if (value) {
            if (name == 'sentence') {
              sentence = value
            } else {
              let paragraphs = []
              const displayName = sceneAttrMapping[name]
              paragraphs.push(createSlateParagraphWithMark(`${displayName}:`, 'bold'))
              const parts = value.split('\n')
              parts.forEach((p) => paragraphs.push(createSlateParagraph(p)))
              paragraphsByName[name] = paragraphs
            }
          }
        }
      }
      sNode['GString'].forEach(addParagraphs)
      sNode['GInteger'].forEach(addParagraphs)
      let firstLine
      if (sentence && wordCountExpected) {
        firstLine = createSlateParagraph(
          `${sentence} (${i18n('{wordCount,number} words', { wordCount: wordCountExpected })})`
        )
      } else if (sentence) {
        firstLine = createSlateParagraph(sentence)
      }
      const description = sceneAttrOrder.reduce((acc, name) => {
        if (paragraphsByName[name]) {
          return [...acc, ...paragraphsByName[name]]
        } else {
          return acc
        }
      }, [])
      if (firstLine) description.unshift(firstLine)

      // i don't think the date field is used or it's like a created date
      // sNode['GLong']['_attributes']['name'] == 'date'

      let character
      let characterLineId
      if (characterName) {
        // find the right character
        character = currentState.characters.find((ch) => ch.name == characterName)
        if (character) {
          // make that caracter a main character
          character.categoryId = '1'
          // find or create a line for that character
          if (linesByTitle[characterName]) {
            characterLineId = linesByTitle[characterName]
          } else {
            // create a new line
            characterLineId = createNewLine(
              currentState.lines,
              {
                position: nextLinePosition,
                title: characterName,
                color: nextColor(nextLinePosition),
              },
              bookId
            )
            nextLinePosition++
            linesByTitle[characterName] = characterLineId
          }
        }
      }

      const cardLineId = characterLineId || lineId

      // stack any that are in the same beat and line
      let positionWithinLine = 0
      if (character && scenesByBeatByCharacter[beatId][characterName]) {
        const numInBeat = scenesByBeatByCharacter[beatId][characterName].length
        if (numInBeat > 1) {
          positionWithinLine = createdScenesByBeatByCharacter[beatId][characterName]
            ? createdScenesByBeatByCharacter[beatId][characterName].length
            : 0
        }
      } else {
        const numInBeat = scenesByBeat[beatId].length
        if (numInBeat > 1) {
          positionWithinLine = createdScenesByBeat[beatId] ? createdScenesByBeat[beatId].length : 0
        }
      }

      let sentenceTitle = sentence.length > 30 ? `${sentence.substr(0, 30)}...` : sentence

      const values = {
        beatId: idMap[beatId],
        lineId: cardLineId,
        description,
        positionWithinLine,
        title: sentence ? sentenceTitle : i18n('Scene {num}', { num: positionWithinLine + 1 }),
        characters: character ? [character.id] : [],
      }

      createNewCard(currentState.cards, values)

      // mark that we've created scenes
      createdScenesByBeat[beatId] = createdScenesByBeat[beatId]
        ? [...createdScenesByBeat[beatId], values]
        : [values]
      if (character) {
        if (createdScenesByBeatByCharacter[beatId]) {
          if (createdScenesByBeatByCharacter[beatId][characterName]) {
            createdScenesByBeatByCharacter[beatId][characterName] = [
              ...createdScenesByBeatByCharacter[beatId][characterName],
              values,
            ]
          } else {
            createdScenesByBeatByCharacter[beatId][characterName] = [values]
          }
        } else {
          createdScenesByBeatByCharacter[beatId] = { [characterName]: [values] }
        }
      }
    })
  }
}

const characterAttrMapping = {
  name: 'name',
  sentence: 'One-Sentence Summary',
  ambition: 'Ambition',
  goal: 'Goal',
  values: 'Values',
  conflict: 'Conflict',
  epiphany: 'Epiphany',
  paragraph: 'One-Paragraph Summary',
  othersSee: 'How others see character',
  birthDate: 'Date of Birth',
  age: 'Age',
  height: 'Height',
  weight: 'Weight',
  ethnicity: 'Ethnic Heritage',
  hairColor: 'Hair Color',
  eyeColor: 'Eye Color',
  physicalDescription: 'Physical Description',
  dressStyle: 'Style of Dressing',
  personality: 'Personality Type',
  senseHumor: 'Sense of Humor',
  religion: 'Religion',
  politics: 'Political Party',
  hobbies: 'Hobbies',
  music: 'Favorite Music',
  books: 'Favorite Books',
  movies: 'Favorite Movies',
  colors: 'Favorite Colors',
  purseWallet: 'Contents of purse or wallet',
  homeDescription: 'Description of home',
  education: 'Educational Background',
  work: 'Work Experience',
  family: 'Family',
  bestFriend: 'Best Friend',
  maleFriends: 'Male Friends',
  femaleFriends: 'Female Friends',
  enemies: 'Enemies',
  bestMemory: 'Best childhood memory',
  worstMemory: 'Worst childhood memory',
  characterization: 'One-line characterization',
  strongTrait: 'Strongest character trait',
  weakTrait: 'Weakest character trait',
  paradox: "Character's Paradox",
  hope: 'Greatest Hope',
  fear: 'Deepest Fear',
  philosophy: 'Philosophy of Life',
  seesSelf: 'How character sees self',
  change: 'How character will change',
  synopsis: 'Character Synopsis',
}

const characterAttrOrder = [
  'One-Sentence Summary',
  'Ambition',
  'Goal',
  'Values',
  'Conflict',
  'Epiphany',
  'One-Paragraph Summary',
  'Date of Birth',
  'Age',
  'Height',
  'Weight',
  'Ethnic Heritage',
  'Hair Color',
  'Eye Color',
  'Physical Description',
  'Style of Dressing',
  'Personality Type',
  'Sense of Humor',
  'Religion',
  'Political Party',
  'Hobbies',
  'Favorite Music',
  'Favorite Books',
  'Favorite Movies',
  'Favorite Colors',
  'Contents of purse or wallet',
  'Description of home',
  'Educational Background',
  'Work Experience',
  'Family',
  'Best Friend',
  'Male Friends',
  'Female Friends',
  'Enemies',
  'Best childhood memory',
  'Worst childhood memory',
  'One-line characterization',
  'Strongest character trait',
  'Weakest character trait',
  "Character's Paradox",
  'Greatest Hope',
  'Deepest Fear',
  'Philosophy of Life',
  'How character sees self',
  'How others see character',
  'How character will change',
  'Character Synopsis',
]

const sceneAttrMapping = {
  paragraph: 'Scene Notes',
  date: 'Date',
  location: 'Location',
}

const sceneAttrOrder = ['location', 'paragraph']
