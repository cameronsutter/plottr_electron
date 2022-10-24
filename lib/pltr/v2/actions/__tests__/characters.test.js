import { configureStore } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { removeSystemKeys } from '../../reducers/systemReducers'
import { editCharacterAttributeValue } from '../characters'
import { goldilocks } from './fixtures'
import { characterAttributesSelector, singleCharacterSelector } from '../../selectors/characters'
import { allCharacterAttributesSelector } from '../../selectors/attributes'

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

const ignoringChangesWeDontCareAbout = (state) => {
  return {
    ...state,
    file: {
      ...state.file,
      dirty: null,
      versionStamp: null,
    },
  }
}

describe('editCharacterAttributeValue', () => {
  describe('given the initial state store', () => {
    it('should produce the initial state store', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(editCharacterAttributeValue(1, 1, 'test'))
      const finalState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(finalState)
      )
    })
  })
  describe('given a state with a legacy attribute', () => {
    describe('and an id that does not match that attribute', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Goldilocks', false, goldilocks, '2020.7.30', 'device:///tmp.dummy.pltr')
        )
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(editCharacterAttributeValue(1, 1, 'test'))
        const finalState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(finalState)
        )
      })
    })
    describe('and the name of that attribute', () => {
      it('should add a new custom attribute and alter its value', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Goldilocks', false, goldilocks, '2020.7.30', 'device:///tmp.dummy.pltr')
        )
        store.dispatch(editCharacterAttributeValue(1, 'Species', 'Borg'))
        const characterAttributes = characterAttributesSelector(store.getState().present, 1)
        expect(characterAttributes).toEqual([
          {
            id: '1',
            bookId: 'all',
            value: 'Borg',
          },
        ])
        const attributes = allCharacterAttributesSelector(store.getState().present)
        expect(attributes).toEqual([
          {
            id: '1',
            type: 'text',
          },
        ])
      })
    })
  })
})
