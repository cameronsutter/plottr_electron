import xml from 'xml-js'
import fs from 'fs'
import i18n from 'format-message'
import { cloneDeep } from 'lodash'
import { objectId, nextId } from '../../../app/store/newIds'
import {
  book as defaultBook,
  note as defaultNote,
  character as defaultCharacter,
  card as defaultCard
} from '../../../../shared/initialState'

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

  storyLine(currentState, json, bookTitle, bookId)
  synopsis(currentState, json, bookTitle, bookId)

  console.log(currentState.notes)

  // characterInfoList
  //   each one is a character
  //
  //   sentence -> description
  //   paragraph -> notes
  // add custom attributes for:
  //   ambition
  //   goal
  //   conflict
  //   epiphany
  //   synopsis
  //   [there can be a lot more, and we'll need a mapping from the name of the attr to what the UI calls it]

  // sceneList
  //   each one is a card in a chapter
  //
  //   chapter -> chapter (stack any that are in the same chapter)
  //   sentence -> slate paragraph in description
  //   paragraph -> slate paragraph in description
  //   povName -> slate paragraph in description
  //   date -> slate paragraph in description
  //   location" value="" description="The location of the scene."/>
  //   pageCountExpected -> slate paragraph in description
  //   wordCountExpected -> slate paragraph in description
  //   wordCountActual -> slate paragraph in description

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

function createSlateEditor (paragraphs) {
  return paragraphs.map(p => ( {children: [{text: p}]} ))
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

function storyLine (currentState, json, bookTitle, bookId) {
  const storyLineNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'storyLine')
  if (storyLineNode && storyLineNode['GString']) {
    // storyLine sentence -> note
    let storyLineAttr = storyLineNode['GString'].find(n => n['_attributes']['name'] == 'sentence')
    if (storyLineAttr) {
      createNewNote(currentState.notes, {
        title: `[${bookTitle}] ${i18n('Story Line Sentence')}`,
        bookIds: [bookId],
        content: createSlateEditor([storyLineAttr['_attributes']['value']])
      })
    }
    // storyLine paragraph -> note
    storyLineAttr = storyLineNode['GString'].find(n => n['_attributes']['name'] == 'paragraph')
    if (storyLineAttr) {
      createNewNote(currentState.notes, {
        title: `[${bookTitle}] ${i18n('Story Line Paragraph')}`,
        bookIds: [bookId],
        content: createSlateEditor([storyLineAttr['_attributes']['value']])
      })
    }
  }
}

function synopsis (currentState, json, bookTitle, bookId) {
  let synopsisNode = json['GContainer']['GContainer'].find(n => n['_attributes']['name'] == 'shortSynopsis')
  if (synopsisNode && synopsisNode['GString']) {
    // short synopsis -> in a note (each line of it as a slate paragraph)
    let paragraphs = synopsisNode['GString'].map(n => n['_attributes']['value'])
    if (paragraphs && paragraphs.length) {
      createNewNote(currentState.notes, {
        title: `[${bookTitle}] ${i18n('Short Synopsis')}`,
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
        title: `[${bookTitle}] ${i18n('Long Synopsis')}`,
        bookIds: [bookId],
        content: createSlateEditor(paragraphs)
      })
    }
  }
}