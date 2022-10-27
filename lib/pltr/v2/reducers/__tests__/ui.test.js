import { configureStore } from './fixtures/testStore'
import { goldilocks, hamlet } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'

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

describe('loadFile', () => {
  describe('given the empty file state', () => {
    it('should include an empty attribute ordering', () => {
      const store = initialStore()
      expect(store.getState().present.ui.customAttributeOrder).toEqual({
        characters: [],
      })
    })
  })
  describe('given a file with one legacy attribute', () => {
    describe('and no ordering for that attribute', () => {
      it('should add a singleton ordering', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Goldilocks',
            false,
            goldilocks,
            goldilocks.file.version,
            'device://tmp/dummy-goldilocks.pltr'
          )
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              type: 'customAttributes',
              name: 'Species',
            },
          ],
        })
      })
    })
  })
  describe('given a file with multiple legacy character custom attributes', () => {
    describe('and no ordering for those attributes', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device://tmp/dummy-hamlet.pltr')
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              name: 'Royal Family Member',
              type: 'customAttributes',
            },
            {
              name: 'Characters That Die',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
})
