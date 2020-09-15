import xml from 'xml-js'
import fs from 'fs'
import i18n from 'format-message'
import { cloneDeep, uniq, keyBy, groupBy } from 'lodash'
import { objectId, nextId } from '../../../app/store/newIds'
import {
  book as defaultBook,
  note as defaultNote,
  character as defaultCharacter,
  card as defaultCard,
  chapter as defaultChapter,
  line as defaultLine,
} from '../../../../shared/initialState'
import { nextPositionInBook } from '../../../app/helpers/lists'

export default function Importer (path, isNewFile, state) {
  const importedXML = fs.readFileSync(path, 'utf-8')
  const currentState = cloneDeep(state)

  const json = JSON.parse(xml.xml2json(importedXML, {compact: true, spaces: 2}))

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

function createNewBook (currentBooks) {
  const nextBookId = objectId(currentBooks.allIds)
  const newBook = Object.assign({}, defaultBook, {id: nextBookId})
  currentBooks.allIds.push(nextBookId)
  currentBooks[`${nextBookId}`] = newBook

  return nextBookId
}

function createNewNote (currentNotes, values) {
  const nextNoteId = nextId(currentNotes)
  const newNote = Object.assign({}, defaultNote, {id: nextNoteId, ...values})
  currentNotes.push(newNote)
}

function createNewCharacter (currentCharacters, values) {
  const nextCharacterId = nextId(currentCharacters)
  const newCharacter = Object.assign({}, defaultCharacter, {id: nextCharacterId, ...values})
  currentCharacters.push(newCharacter)
}

function createNewCard (currentCards, values) {
  const nextCardId = nextId(currentCards)
  const newCard = Object.assign({}, defaultCard, {id: nextCardId, ...values})
  currentCards.push(newCard)
}

function createNewLine (currentLines, values, bookId) {
  const nexLineId = nextId(currentLines)
  const position = nextPositionInBook(currentLines, bookId)
  const newChapter = Object.assign({}, defaultLine, {id: nexLineId, position, bookId, ...values})
  currentLines.push(newChapter)
  return nexLineId
}

function createNewChapter (currentChapters, values, bookId) {
  const nextChapterId = nextId(currentChapters)
  const position = nextPositionInBook(currentChapters, bookId)
  const newChapter = Object.assign({}, defaultChapter, {id: nextChapterId, position, bookId, ...values})
  currentChapters.push(newChapter)
  return nextChapterId
}

function createSlateEditor (paragraphs) {
  return paragraphs.map(createSlateParagraph)
}

function createSlateParagraph (value) {
  return { children: [{text: value}]}
}

function createSlateParagraphWithMark (value, mark) {
  return { children: [{text: value, [mark]: true}]}
}

function bookAttributes (currentBooks, json, bookId) {
  // title of the book (with subtitle)
  const titleAttr = json['GContainer']['GString'].find(n => n['_attributes']['name'] == 'title')
  const subTitleAttr = json['GContainer']['GString'].find(n => n['_attributes']['name'] == 'subtitle')
  if (titleAttr) {
    let title = titleAttr['_attributes']['value']
    if (subTitleAttr) title = `${title}: ${subTitleAttr['_attributes']['value']}`
    currentBooks[`${bookId}`].title = title
  }

  // genre
  const genreAttr = json['GContainer']['GString'].find(n => n['_attributes']['name'] == 'genre')
  if (genreAttr) {
    currentBooks[`${bookId}`].genre = genreAttr['_attributes']['value']
  }

  // target reader -> theme
  const targetReaderAttr = json['GContainer']['GString'].find(n => n['_attributes']['name'] == 'targetReader')
  if (targetReaderAttr) {
    currentBooks[`${bookId}`].theme = targetReaderAttr['_attributes']['value'].replace(/\n/g, ' ')
  }

  // storyLine -> premise
  const storyLineNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'storyLine')
  if (storyLineNode && storyLineNode['GString']) {
    const storyLineAttr = storyLineNode['GString'].find(n => n['_attributes']['name'] == 'sentence')
    if (storyLineAttr) {
      currentBooks[`${bookId}`].premise = storyLineAttr['_attributes']['value']
    }
  }

  // TODO: projected word counts -> in a note
  return titleAttr['_attributes']['value']
}

function storyLine (currentState, json, bookTitle, bookId, isNewFile) {
  const storyLineNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'storyLine')
  if (storyLineNode && storyLineNode['GString']) {
    // storyLine sentence -> note
    let storyLineAttr = storyLineNode['GString'].find(n => n['_attributes']['name'] == 'sentence')
    if (storyLineAttr) {
      createNewNote(currentState.notes, {
        title: isNewFile ? i18n('One Sentence Summary') : `[${bookTitle}] ${i18n('One Sentence Summary')}`,
        bookIds: [bookId],
        content: createSlateEditor([storyLineAttr['_attributes']['value']])
      })
    }
    // storyLine paragraph -> note
    storyLineAttr = storyLineNode['GString'].find(n => n['_attributes']['name'] == 'paragraph')
    if (storyLineAttr) {
      createNewNote(currentState.notes, {
        title: isNewFile ? i18n('One Paragraph Summary') : `[${bookTitle}] ${i18n('One Paragraph Summary')}`,
        bookIds: [bookId],
        content: createSlateEditor([storyLineAttr['_attributes']['value']])
      })
    }
  }
}

function synopsis (currentState, json, bookTitle, bookId, isNewFile) {
  let synopsisNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'shortSynopsis')
  if (synopsisNode && synopsisNode['GString']) {
    // short synopsis -> in a note (each line of it as a slate paragraph)
    let paragraphs = synopsisNode['GString'].map(n => n['_attributes']['value'])
    if (paragraphs && paragraphs.length) {
      createNewNote(currentState.notes, {
        title: isNewFile ? i18n('Short Synopsis') : `[${bookTitle}] ${i18n('Short Synopsis')}`,
        bookIds: [bookId],
        content: createSlateEditor(paragraphs)
      })
    }
  }
  synopsisNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'longSynopsis')
  if (synopsisNode && synopsisNode['GString']) {
    // long synopsis -> in a note (each line of it as a slate paragraph)
    let paragraphs = synopsisNode['GString'].map(n => n['_attributes']['value'])
    if (paragraphs && paragraphs.length) {
      createNewNote(currentState.notes, {
        title: isNewFile ? i18n('Long Synopsis') : `[${bookTitle}] ${i18n('Long Synopsis')}`,
        bookIds: [bookId],
        content: createSlateEditor(paragraphs)
      })
    }
  }
}

function characters(currentState, json, bookId) {
  const characterListNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'characterInfoList')
  if (characterListNode && characterListNode['GContainer'] && characterListNode['GContainer'].length) {
    let newCustomAttrs = []
    characterListNode['GContainer'].forEach(chNode => {
      if (chNode['GString'] && chNode['GString'].length) {
        let notes = []
        let values = chNode['GString'].reduce((acc, attr) => {
          // get the right attr
          const attrName = characterAttrMapping[attr['_attributes']['name']] || 'notes'
          switch (attrName) {
            case 'notes':
              const parts = attr['_attributes']['value'].split('\n')
              notes.push(...parts)
              break
            case 'name':
              acc['name'] = attr['_attributes']['value']
              break
            case 'description':
              acc['description'] = attr['_attributes']['value'].replace(/\n/g, ' ')
              break
            default:
              acc[attrName] = attr['_attributes']['value'].replace(/\n/g, ' ')
              // also create a custom attribute
              newCustomAttrs.push(attrName)
              break
          }
          return acc
        }, {})
        values['bookIds'] = [bookId]
        const slateNotes = createSlateEditor(notes)
        createNewCharacter(currentState.characters, {...values, notes: slateNotes})
      }
    })
    createCustomCharacterAttributes(currentState, newCustomAttrs)
  }
}

function createCustomCharacterAttributes(currentState, newCustomAttrs) {
  // get names of current ones
  const currentListByName = keyBy(currentState.customAttributes.characters, 'name')
  // add new ones if they don't already exist
  const customAttrs = uniq(newCustomAttrs).reduce((acc, attr) => {
    if (!currentListByName[attr]) acc.push({name: attr, type: 'text'})
    return acc
  }, [])
  currentState.customAttributes.characters = [
    ...currentState.customAttributes.characters,
    ...customAttrs,
  ]
}

function cards(currentState, json, bookId) {
  const sceneListNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'sceneList')
  if (sceneListNode && sceneListNode['GContainer'] && sceneListNode['GContainer'].length) {
    const lineId = createNewLine(currentState.lines, {position: 0, title: i18n('Main Plot')}, bookId)
    const scenesByChapter = groupBy(sceneListNode['GContainer'], (scene) => {
      const node = scene['GInteger'].find(n => n['_attributes']['name'] == 'chapter')
      if (node) return node['_attributes']['value']
      return '1'
    })
    const chapterNumbers = Object.keys(scenesByChapter)

    // idMap is Snowflake id to Plottr id
    const idMap = chapterNumbers.reduce((acc, id) => {
      acc[id] = createNewChapter(currentState.chapters, {position: Number(id) - 1}, bookId)
      return acc
    }, {})

    let createdScenesByChapter = {}

    sceneListNode['GContainer'].forEach(sNode => {
      // each one is a card in a chapter
      let chapterId = null

      let paragraphsByName = {}
      function addParagraphs (node) {
        const name = node['_attributes']['name']
        const value = node['_attributes']['value']
        if (name == 'chapter') {
          chapterId = value
        } else {
          if (value) {
            let paragraphs = []
            const displayName = sceneAttrMapping[name]
            paragraphs.push(createSlateParagraphWithMark(`${displayName}:`, 'bold'))
            const parts = value.split('\n')
            parts.forEach(p => paragraphs.push(createSlateParagraph(p)))
            paragraphsByName[name] = paragraphs
          }
        }
      }
      sNode['GString'].forEach(addParagraphs)
      sNode['GInteger'].forEach(addParagraphs)
      const description = sceneAttrOrder.reduce((acc, name) => {
        if (paragraphsByName[name]) {
          return [...acc, ...paragraphsByName[name]]
        } else {
          return acc
        }
      }, [])

      // i don't think the date field is used or it's like a created date
      // sNode['GLong']['_attributes']['name'] == 'date'

      // stack any that are in the same chapter
      let positionWithinLine = 0
      const numInChapter = scenesByChapter[chapterId].length
      if (numInChapter > 1) {
        positionWithinLine = createdScenesByChapter[chapterId] ? createdScenesByChapter[chapterId].length : 0
      }

      const values = {
        chapterId: idMap[chapterId],
        lineId,
        description,
        positionWithinLine,
        title: i18n('Scene {num}', {num: positionWithinLine + 1}),
      }

      createNewCard(currentState.cards, values)

      createdScenesByChapter[chapterId] = createdScenesByChapter[chapterId] ? [...createdScenesByChapter[chapterId], values] : [values]
    })
  }
}

const characterAttrMapping = {
  'name': 'name',
  'sentence': 'description',
  'paragraph': 'notes',
  'synopsis': 'notes',
  'ambition': 'Ambition',
  'goal': 'Goal',
  'conflict': 'Conflict',
  'epiphany': 'Epiphany',
  'othersSee': 'How others see character',
  'birthDate': 'Date of Birth',
  'age': 'Age',
  'height': 'Height',
  'weight': 'Weight',
  'ethnicity': 'Ethnic Heritage',
  'hairColor': 'Hair Color',
  'eyeColor': 'Eye Color',
  'physicalDescription': 'Physical Description',
  'dressStyle': 'Style of Dressing',
  'personality': 'Personality Type',
  'senseHumor': 'Sense of Humor',
  'religion': 'Religion',
  'politics': 'Political Party',
  'hobbies': 'Hobbies',
  'music': 'Favorite Music',
  'books': 'Favorite Books',
  'movies': 'Favorite Movies',
  'colors': 'Favorite Colors',
  'purseWallet': 'Contents of purse or wallet',
  'homeDescription': 'Description of home',
  'education': 'Educational Background',
  'work': 'Work Experience',
  'family': 'Family',
  'bestFriend': 'Best Friend',
  'maleFriends': 'Male Friends',
  'femaleFriends': 'Female Friends',
  'enemies': 'Enemies',
  'bestMemory': 'Best childhood memory',
  'worstMemory': 'Worst childhood memory',
  'characterization': 'One-line characterization',
  'strongTrait': 'Strongest character trait',
  'weakTrait': 'Weakest character trait',
  'paradox': "Character's Paradox",
  'hope': 'Greatest Hope',
  'fear': 'Deepest Fear',
  'philosophy': 'Philosophy of Life',
  'seesSelf': 'How character sees self',
  'values': 'Values',
  'change': 'How character will change',
}

const sceneAttrMapping = {
  'povName': 'POV',
  'sentence': 'Sentence Summary',
  'paragraph': 'Scene Notes',
  'date': 'Date',
  'location': 'Location',
  'pageCountExpected': 'Expected Pages',
  'wordCountExpected': 'Expected Words',
  'wordCountActual': 'Actual Words',
}

const sceneAttrOrder = ['povName', 'location', 'wordCountExpected', 'wordCountActual', 'pageCountExpected', 'sentence', 'paragraph']