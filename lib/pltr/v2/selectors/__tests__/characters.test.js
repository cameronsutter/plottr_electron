import { configureStore } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { characterBookCategoriesSelector } from '../characters'
import { addCharacter } from '../../../v1/actions/cards'
import { characterAttributesForCurrentBookSelector } from '../attributes'

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
    it('should produce the empty object', () => {
      const store = initialStore()
      const initialState = store.getState().present
      expect(characterBookCategoriesSelector(initialState)).toEqual({})
    })
  })
  describe('given a store with a character', () => {
    describe('and a single book', () => {
      it('should produce an object with a single characterID, and a single category, called "Unassociated" with the book id in an array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState().present
        expect(characterAttributesForCurrentBookSelector(initialState)).toEqual({
          1: {
            Unnassociated: [1],
          },
        })
      })
    })
  })
})
