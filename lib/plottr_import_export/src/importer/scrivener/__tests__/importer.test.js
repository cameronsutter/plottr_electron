import scrivxJSON from './fixtures/example3-jsonified.json'
import { cloneDeep, keys } from 'lodash'
import { emptyFile, initialState, tree } from 'pltr/v2'
import {
  createNewBeat,
  createNewBook,
  createNewCard,
  createNewCategory,
  createNewCharacter,
  createNewLine,
  createNewNote,
  createNewPlace,
  createNewTag,
  getSection,
  withStoryLineIfItExists,
} from '../importer'
import { relevantFiles } from './fixtures/example3-relevantFiles'

let currentState = cloneDeep(initialState)
const bookTitle = 'example3'
const testString1 = 'Test string 1...'
const testString2 = 'Test string 2...'
const testString3 = 'Test string 3...'
const isNewFile = true
let bookId = 1
currentState = emptyFile(bookTitle)
currentState.beats = {
  series: tree.newTree('id'),
}
currentState.lines = []

function isJson(val) {
  if (val && typeof val === 'object') {
    return true
  } else {
    return false
  }
}

const manuscript = scrivxJSON['ScrivenerProject']['Binder']['BinderItem'].find(
  (n) => n['_attributes']['Type'] == 'DraftFolder' || n['Title']['_text'] == 'Manuscript'
)

const sectionsJSON = scrivxJSON['ScrivenerProject']['Binder']['BinderItem'].filter(
  (n) => n['_attributes']['Type'] != 'DraftFolder' && n['_attributes']['Type'] != 'TrashFolder'
)

const characters = getSection(sectionsJSON, 'Characters').filter((i) => i)
const notes = getSection(sectionsJSON, 'Notes').filter((i) => i)
const places = getSection(sectionsJSON, 'Places').filter((i) => i)

describe('ScrivenerImporter', () => {
  describe('createNewBook', () => {
    const bookId = createNewBook(currentState.books)
    it('should return integer', () => {
      expect(typeof bookId).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(bookId).toBe(2)
    })
  })

  describe('withStoryLineIfItExists', () => {
    it('should return an array of files', () => {
      const storyLines = withStoryLineIfItExists(
        manuscript,
        currentState,
        bookTitle,
        bookId,
        isNewFile,
        relevantFiles
      )
      expect(isJson(storyLines)).toBeTruthy()
    })
  })

  describe('getSection', () => {
    it('should return an array of files', () => {
      expect(Array.isArray(characters)).toBeTruthy()
      expect(Array.isArray(notes)).toBeTruthy()
      expect(Array.isArray(places)).toBeTruthy()
    })
  })

  describe('createNewCharacter', () => {
    const newCharacter1 = createNewCharacter(currentState.characters, { name: testString1, bookId })
    const newCharacter2 = createNewCharacter(currentState.characters, { name: testString2, bookId })
    const newCharacter3 = createNewCharacter(currentState.characters, { name: testString3, bookId })
    const newCharacter4 = createNewCharacter(currentState.characters, { name: testString3, bookId })

    it('should return an id interger', () => {
      expect(typeof newCharacter1).toBe('number')
      expect(typeof newCharacter2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newCharacter1).toBe(1)
    })

    it('should return found character id if name of character exists', () => {
      expect(newCharacter4).toEqual(newCharacter3)
    })

    expect(newCharacter2).toBe(2)
    expect(newCharacter3).toBe(3)
  })

  describe('createNewNote', () => {
    const newNote1 = createNewNote(currentState.notes, { title: testString1, bookId })
    const newNote2 = createNewNote(currentState.notes, { title: testString2, bookId })
    const newNote3 = createNewNote(currentState.notes, { title: testString3, bookId })
    const newNote4 = createNewNote(currentState.notes, { title: testString3, bookId })

    it('should return an id interger', () => {
      expect(typeof newNote1).toBe('number')
      expect(typeof newNote2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newNote1).toBe(1)
      expect(newNote2).toBe(2)
      expect(newNote3).toBe(3)
    })

    it('should return found note id if title of note exists', () => {
      expect(newNote4).toEqual(newNote3)
    })
  })

  describe('createNewPlace', () => {
    const newPlace1 = createNewPlace(currentState.places, { name: testString1, bookId })
    const newPlace2 = createNewPlace(currentState.places, { name: testString2, bookId })
    const newPlace3 = createNewPlace(currentState.places, { name: testString3, bookId })
    const newPlace4 = createNewPlace(currentState.places, { name: testString3, bookId })
    it('should return an id interger', () => {
      expect(typeof newPlace1).toBe('number')
      expect(typeof newPlace2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newPlace1).toBe(1)
      expect(newPlace2).toBe(2)
      expect(newPlace3).toBe(3)
    })

    it('should return found place id if name of place exists', () => {
      expect(newPlace4).toEqual(newPlace3)
    })
  })

  describe('createNewCard', () => {
    let currentCards = currentState.cards
    currentCards = createNewCard(currentCards, { title: testString1, bookId, id: 1 })
    currentCards = createNewCard(currentCards, { title: testString2, bookId, id: 2 })
    currentCards = createNewCard(currentCards, { title: testString3, bookId, id: 3 })
    currentCards = createNewCard(currentCards, { title: testString3, bookId, id: 4 })
    currentCards = createNewCard(currentCards, { title: testString3, bookId, id: 4 })
    const similarCards = currentCards.filter((item) => item.title == testString3)

    it('should return an Array', () => {
      expect(Array.isArray(currentCards)).toBeTruthy()
    })

    it('should create a new card regardless if title already exists', () => {
      expect(similarCards).toHaveLength(2)
      expect(similarCards[0].title).toEqual(similarCards[1].title)
    })

    it('should not create card if title and id exists', () => {
      expect(similarCards[0].id).not.toEqual(similarCards[1].id)
      expect(currentCards).toHaveLength(4)
    })
  })

  describe('createNewLine', () => {
    const newLine = createNewLine(currentState.lines, { title: testString1, id: 1 }, bookId)

    it('should return the line id', () => {
      expect(typeof newLine).toBe('number')
    })
  })

  describe('createNewBeat', () => {
    const newBeat = createNewBeat(currentState, { title: testString1 }, bookId)
    const beatId = keys(newBeat)[0]

    it('should return an object', () => {
      expect(typeof newBeat).toBe('object')
    })

    it('should have a string id', () => {
      expect(typeof beatId).toBe('string')
      expect(beatId).toBe('1')
    })
  })

  describe('createNewCategory', () => {
    const newCategory1 = createNewCategory(currentState.categories.notes, {
      name: testString1,
      bookId,
    })
    const newCategory2 = createNewCategory(currentState.categories.places, {
      name: testString2,
      bookId,
    })
    const newCategory3 = createNewCategory(currentState.categories.characters, {
      name: testString3,
      bookId,
    })
    const newCategory4 = createNewCategory(currentState.categories.characters, {
      name: testString3,
      bookId,
    })

    it('should return an id interger', () => {
      expect(typeof newCategory1).toBe('number')
      expect(typeof newCategory2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newCategory1).toBe(1)
    })

    it('should return found category id if name of category exists', () => {
      expect(newCategory4).toEqual(newCategory3)
    })

    expect(newCategory2).toBe(2)
    expect(newCategory3).toBe(3)
  })

  describe('createNewTag', () => {
    const newTag1 = createNewTag(currentState.tags, { title: testString1, bookId })
    const newTag2 = createNewTag(currentState.tags, { title: testString2, bookId })
    const newTag3 = createNewTag(currentState.tags, { title: testString3, bookId })
    const newTag4 = createNewTag(currentState.tags, { title: testString3, bookId })

    it('should return an id interger', () => {
      expect(typeof newTag1).toBe('number')
      expect(typeof newTag2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newTag1).toBe(1)
    })

    it('should return found tag id if title of tag exists', () => {
      expect(newTag4).toEqual(newTag3)
    })

    expect(newTag2).toBe(2)
    expect(newTag3).toBe(3)
  })
})
