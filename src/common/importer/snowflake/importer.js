import xml from 'xml-js'
import fs from 'fs'
import { cloneDeep } from 'lodash'
import { objectId } from '../../../app/store/newIds'
import { book as defaultBook } from '../../../../shared/initialState'

export default function Importer (path, isNewFile, state) {
  const importedXML = fs.readFileSync(path, 'utf-8')
  const currentState = cloneDeep(state)

  const json = JSON.parse(xml.xml2json(importedXML, {compact: true, spaces: 2}))

  // create a new book (if not new file)
  let bookId = 1
  if (!isNewFile) {
    bookId = createNewBook(currentState.books)
  }

  bookAttributes(currentState.books, json, bookId)
  console.log(currentState.books)

  // storyLine
  //   sentence -> in a note
  //   paragraph -> in a note

  // short synopsis -> in a note
  //   each line of it as a slate paragraph

  // long synopsis -> in a note
  //   each line of it as a slate paragraph

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
  if (storyLineNode) {
    const storyLineAttr = storyLineNode['GString'].find(n => n['_attributes']['name'] == 'sentence')
    currentBooks[`${bookId}`].premise = storyLineAttr['_attributes']['value']
  }

  // TODO: projected word counts -> in a note
}
