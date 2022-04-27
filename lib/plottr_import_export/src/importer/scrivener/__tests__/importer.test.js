import scrivxJSON from './fixtures/scrivener-example3-jsonified.json'
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
  createSlateEditor,
  createSlateParagraph,
  getManuscriptSectionItems,
  getMatchedRelevantFiles,
  getSection,
  getVer_2_7_matchedFiles,
  getVer_2_7_matchName,
  mapMatchedFiles,
  nextPositionInLine,
  withStoryLineIfItExists,
} from '../importer'
import { relevantFiles } from './fixtures/scrivener-example3-relevantFiles'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/
const UUID = '0819AE12-01F2-4F7A-B64F-B5EB07589699'
const BOOK_TITLE = 'example3'
const TEST_STRING_1 = 'Test string 1...'
const TEST_STRING_2 = 'Test string 2...'
const TEST_STRING_3 = 'Test string 3...'

const TEXT_OBJECT_1 = {
  text: TEST_STRING_1,
}

const TEXT_OBJECT_2 = {
  text: TEST_STRING_2,
}

const TEXT_OBJECT_3 = {
  text: TEST_STRING_3,
}

const MAIN_CATEGORY_OBJ = { id: 1, name: 'Main', position: 0 }

let currentState = cloneDeep(initialState)
const isNewFile = true
let bookId = 1
currentState = emptyFile(BOOK_TITLE)
currentState.beats = {
  series: tree.newTree('id'),
}
currentState.lines = []

function isAnObject(val) {
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
    it('should return a json', () => {
      const storyLines = withStoryLineIfItExists(
        manuscript,
        currentState,
        BOOK_TITLE,
        bookId,
        isNewFile,
        relevantFiles
      )
      expect(isAnObject(storyLines)).toBeTruthy()
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
    const newCharacter1 = createNewCharacter(currentState.characters, {
      name: TEST_STRING_1,
      bookId,
    })
    const newCharacter2 = createNewCharacter(currentState.characters, {
      name: TEST_STRING_2,
      bookId,
    })
    const newCharacter3 = createNewCharacter(currentState.characters, {
      name: TEST_STRING_3,
      bookId,
    })
    const newCharacter4 = createNewCharacter(currentState.characters, {
      name: TEST_STRING_3,
      bookId,
    })

    it('should return an id interger', () => {
      expect(typeof newCharacter1).toBe('number')
      expect(typeof newCharacter2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newCharacter1).toBe(1)
      expect(newCharacter2).toBe(2)
      expect(newCharacter3).toBe(3)
    })

    it('should return found character id if name of character exists', () => {
      expect(newCharacter4).toEqual(newCharacter3)
    })
  })

  describe('createNewNote', () => {
    const newNote1 = createNewNote(currentState.notes, { title: TEST_STRING_1, bookId })
    const newNote2 = createNewNote(currentState.notes, { title: TEST_STRING_2, bookId })
    const newNote3 = createNewNote(currentState.notes, { title: TEST_STRING_3, bookId })
    const newNote4 = createNewNote(currentState.notes, { title: TEST_STRING_3, bookId })

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
    const newPlace1 = createNewPlace(currentState.places, { name: TEST_STRING_1, bookId })
    const newPlace2 = createNewPlace(currentState.places, { name: TEST_STRING_2, bookId })
    const newPlace3 = createNewPlace(currentState.places, { name: TEST_STRING_3, bookId })
    const newPlace4 = createNewPlace(currentState.places, { name: TEST_STRING_3, bookId })
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
    currentCards = createNewCard(currentCards, { title: TEST_STRING_1, bookId, id: 1 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_2, bookId, id: 2 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_3, bookId, id: 3 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_3, bookId, id: 4 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_3, bookId, id: 4 })
    const similarCards = currentCards.filter((item) => item.title == TEST_STRING_3)

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
    const newLine = createNewLine(currentState.lines, { title: TEST_STRING_1, id: 1 }, bookId)

    it('should return the line id', () => {
      expect(typeof newLine).toBe('number')
    })
  })

  describe('createNewBeat', () => {
    const newBeat = createNewBeat(currentState, { title: TEST_STRING_1 }, bookId)
    const beatId = keys(newBeat)[0]

    it('should return an object', () => {
      expect(isAnObject(newBeat)).toBeTruthy()
    })

    it('should have a string id', () => {
      expect(typeof beatId).toBe('string')
      expect(beatId).toBe('1')
    })
  })

  describe('createNewCategory', () => {
    const newCategory1 = createNewCategory(currentState.categories.notes, TEST_STRING_1)
    const newCategory2 = createNewCategory(currentState.categories.notes, TEST_STRING_3)
    const newCategory3 = createNewCategory(currentState.categories.characters, TEST_STRING_3)
    const newCategory4 = createNewCategory(currentState.categories.characters, TEST_STRING_3)

    it('should return an id interger', () => {
      expect(typeof newCategory1).toBe('number')
      expect(typeof newCategory2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newCategory2).toBeGreaterThan(newCategory1)
      expect(newCategory2 - newCategory1).toBe(1)
    })

    it('should a default category name of "Main" except for places', () => {
      const characters = currentState.categories.characters.find((cat) => cat.name == 'Main')
      const notes = currentState.categories.notes.find((cat) => cat.name == 'Main')
      const tags = currentState.categories.tags.find((cat) => cat.name == 'Main')
      const places = currentState.categories.places.find((cat) => cat && cat.name == 'Main')

      expect(characters).toEqual(MAIN_CATEGORY_OBJ)
      expect(notes).toEqual(MAIN_CATEGORY_OBJ)
      expect(tags).toEqual(MAIN_CATEGORY_OBJ)
      expect(places).not.toEqual(MAIN_CATEGORY_OBJ)
      expect(places).toBeUndefined()
    })

    it('should return found category id if name of category exists', () => {
      expect(newCategory4).toEqual(newCategory3)
    })
  })

  describe('createNewTag', () => {
    const newTag1 = createNewTag(currentState.tags, TEST_STRING_1)
    const newTag2 = createNewTag(currentState.tags, TEST_STRING_2)
    const newTag3 = createNewTag(currentState.tags, TEST_STRING_3)
    const newTag4 = createNewTag(currentState.tags, TEST_STRING_3)

    it('should return an id interger', () => {
      expect(typeof newTag1).toBe('number')
      expect(typeof newTag2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newTag1).toBe(1)
      expect(newTag2).toBe(2)
      expect(newTag3).toBe(3)
    })

    it('should return found tag id if title of tag exists', () => {
      expect(newTag4).toEqual(newTag3)
    })
  })

  describe('createSlateParagraph', () => {
    const slateObj1 = createSlateParagraph(TEXT_OBJECT_1)
    const slateObj2 = createSlateParagraph(TEXT_OBJECT_2)

    it('should return an object', () => {
      expect(isAnObject(slateObj1)).toBeTruthy()
      expect(isAnObject(slateObj2)).toBeTruthy()
    })

    it('should return have a "children" key', () => {
      const childrenArr = keys(slateObj1).find((item) => item == 'children')
      expect(childrenArr).toBeTruthy()
    })
  })

  describe('createSlateEditor', () => {
    const slateEditorObj = createSlateEditor([TEXT_OBJECT_1, TEXT_OBJECT_2])

    it('should return an object', () => {
      expect(isAnObject(slateEditorObj)).toBeTruthy()
    })

    it('should have "type" and "children" object keys', () => {
      expect(slateEditorObj).toMatchObject({
        type: expect.any(String),
        children: expect.any(Array),
      })
    })
  })

  describe('getMatchedRelevantFiles', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)

    it('should return an array', () => {
      expect(Array.isArray(files)).toBeTruthy()
    })

    it('should have a "filePath" and "contents" keys', () => {
      files.forEach((file) => {
        expect(file).toMatchObject({ filePath: expect.any(String), contents: expect.any(Object) })
      })
    })
  })

  describe('getVer_2_7_matchName', () => {
    const file = relevantFiles.filter((f) => !UUIDFolderRegEx.test(f.filePath))
    const relevantFileNames = ['notes.rtf', 'synopsis.txt']

    file.forEach((f) => {
      const matchedFile = getVer_2_7_matchName(f.filePath, UUID)
      const strippedMatchedFileName = matchedFile.split('_').pop()

      it('should not have relevant files', () => {
        expect(relevantFileNames).toEqual(expect.not.arrayContaining([strippedMatchedFileName]))
      })
    })
  })

  describe('nextPositionInLine', () => {
    const lineId = 1
    const beatId = 1
    let currentCards = currentState.cards
    currentCards = createNewCard(currentCards, {
      title: TEST_STRING_1,
      bookId,
      lineId,
      beatId,
      positionWithinLine: nextPositionInLine(currentCards, lineId, beatId),
    })
    currentCards = createNewCard(currentCards, {
      title: TEST_STRING_1,
      bookId,
      lineId,
      beatId,
      positionWithinLine: nextPositionInLine(currentCards, lineId, beatId),
    })

    it('should return next positionWithinLine if previous and current card have the same beatId and lineId', () => {
      currentCards.forEach((card, idx) => {
        if (
          currentCards[idx - 1] &&
          card.beatId == currentCards[idx - 1].beatId &&
          card.lineId == currentCards[idx - 1].lineId
        ) {
          expect(card.positionWithinLine).toBeGreaterThan(currentCards[idx - 1].positionWithinLine)
        }
      })
    })

    it('should return 0 as positionWithinLine if previous and current card beatId and lineId is not the same', () => {
      currentCards.forEach((card, idx) => {
        if (currentCards[idx - 1] && card.beatId == !currentCards[idx - 1].beatId) {
          expect(card.positionWithinLine).toBe(0)
        }
      })
    })
  })

  describe('withStoryLineIfItExists', () => {
    const storyLines = withStoryLineIfItExists(
      manuscript,
      currentState,
      BOOK_TITLE,
      bookId,
      isNewFile,
      relevantFiles
    )
    it('should return a json', () => {
      expect(isAnObject(storyLines)).toBeTruthy()
    })
  })

  describe('mapMatchedFiles', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)
    let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
    const matchedFiles = mapMatchedFiles(currentState, files, fileContents, bookId)

    it('should return an object', () => {
      expect(isAnObject(matchedFiles)).toBeTruthy()
    })

    it('should have "rtfContents" and "txtContent" keys', () => {
      const expectedKeys = ['rtfContents', 'txtContent']
      const fileContentKeys = keys(fileContents)
      expect(fileContentKeys).toHaveLength(2)
      expect(fileContentKeys).toEqual(expect.arrayContaining(expectedKeys))
    })
  })

  describe('getManuscriptSectionItems', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)
    let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
    const mappedFiles = mapMatchedFiles(currentState, files, fileContents, bookId)
    fileContents = {
      ...fileContents,
      rtfContents: mappedFiles.rtfContents,
    }
    const contents = fileContents.rtfContents.contents
    const sectionItemsFromManuscript = getManuscriptSectionItems(currentState, contents, bookId)
    const sectionItems = ['characters', 'notes', 'places', 'tags']

    it('should return an array of objects', () => {
      expect(Array.isArray(sectionItemsFromManuscript)).toBeTruthy()

      sectionItemsFromManuscript.forEach((section) => {
        expect(isAnObject(section)).toBeTruthy()
      })
    })

    it('should have an object key name that belongs to section', () => {
      sectionItemsFromManuscript.forEach((section) => {
        const sectionItemKey = keys(section)[0]
        expect(sectionItems).toContain(sectionItemKey)
      })
    })
  })
})
