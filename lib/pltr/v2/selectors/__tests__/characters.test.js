import { configureStore } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import {
  allBooksWithCharactersInThemSelector,
  characterBookCategoriesSelector,
} from '../characters'
import { addCharacter } from '../../actions/characters'
import { addBook } from '../../actions/books'
import { addBook as addBookToCharacter } from '../../actions/characters'

const EMPTY_FILE = emptyFile('Test file')
const initialStore = () => {
  const store = configureStore()
  store.dispatch(
    loadFile(
      'Test file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://tmp/dummy-url-test-file.pltr'
    )
  )
  return store
}

describe('characterBookCategoriesSelector', () => {
  describe('given a store with no characters', () => {
    it('should produce the empty array', () => {
      const store = initialStore()
      const initialState = store.getState().present
      expect(characterBookCategoriesSelector(initialState)).toEqual([])
    })
  })
  describe('given a store with a character', () => {
    describe('and a single book', () => {
      it('should produce an array with a single category called "Not in Book" with the book id in an array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState().present
        expect(characterBookCategoriesSelector(initialState)).toEqual([
          {
            glyph: 'plus',
            lineAbove: true,
            displayHeading: true,
            key: 'Not in Book',
            'Not in Book': [1],
          },
        ])
      })
      describe('and that character is associated with that book', () => {
        it('should produce an array with a single category, called "Characters In Book" with the book id in an array as the value', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          const initialState = store.getState().present
          expect(characterBookCategoriesSelector(initialState)).toEqual([
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': [1],
            },
          ])
        })
      })
    })
    describe('and two books', () => {
      it('should produce an array with a single category, called "Not in Book" with the book ids in the array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBook())
        const initialState = store.getState().present
        expect(characterBookCategoriesSelector(initialState)).toEqual([
          {
            glyph: 'plus',
            lineAbove: true,
            displayHeading: true,
            key: 'Not in Book',
            'Not in Book': [1],
          },
        ])
      })
      describe('and that character is associated with the first book', () => {
        it('should produce an array with two categories, called "Characters In Book" & "Not in Book" with the corresponding book ids', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBook())
          store.dispatch(addBookToCharacter(1, 1))
          const initialState = store.getState().present
          expect(characterBookCategoriesSelector(initialState)).toEqual([
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': [1],
            },
          ])
        })
      })
      describe('and two characters', () => {
        describe('and the first character is associated with the first book', () => {
          it('should produce an array with two categories, called "Characters In Book" & "Not in Book" with the corresponding book ids', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addCharacter('Jane Doe'))
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            const initialState = store.getState().present
            expect(characterBookCategoriesSelector(initialState)).toEqual([
              {
                displayHeading: false,
                key: 'Characters In Book',
                'Characters In Book': [1],
              },
              {
                glyph: 'plus',
                lineAbove: true,
                displayHeading: true,
                key: 'Not in Book',
                'Not in Book': [2],
              },
            ])
          })
        })
      })
    })
  })
})

describe('allBooksWithCharactersInThemSelector', () => {
  describe('given the empty file state', () => {
    it('should produce an object containing only the untitled book', () => {
      const store = initialStore()
      const state = store.getState().present
      expect(allBooksWithCharactersInThemSelector(state)).toEqual({
        1: {
          id: 1,
          title: 'Test file',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
      })
    })
  })
  describe('given a file with two books', () => {
    it('should produce an object containing both books', () => {
      const store = initialStore()
      store.dispatch(addBook())
      const state = store.getState().present
      expect(allBooksWithCharactersInThemSelector(state)).toEqual({
        1: {
          id: 1,
          title: 'Test file',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
        2: {
          id: 2,
          title: '',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
      })
    })
    describe('and one of the books is associated with the first character', () => {
      it('should only produce the first book', () => {
        const store = initialStore()
        store.dispatch(addBook())
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        const state = store.getState().present
        expect(allBooksWithCharactersInThemSelector(state)).toEqual({
          1: {
            id: 1,
            title: 'Test file',
            premise: '',
            genre: '',
            theme: '',
            templates: [],
            timelineTemplates: [],
            imageId: null,
          },
        })
      })
    })
  })
})
