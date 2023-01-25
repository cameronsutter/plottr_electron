import { initial, omit } from 'lodash'

import { configureStore } from './fixtures/testStore'
import { post_multi_hierarchy_zelda } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { addBook, deleteBook } from '../../actions/books'
import { removeSystemKeys } from '../systemReducers'

import { setHierarchyLevels, editHierarchyLevel } from '../../actions/hierarchy'
import { hierarchyLevel } from '../../store/initialState'

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
  store.dispatch(addBook('Second Book', 'A great story', 'Action', 'Careful what you wish for'))
  return store
}

// addBook is called in the setup
describe('addBook', () => {
  it('should add an appropriately keyed hierarchy level', () => {
    const store = initialStore()
    expect(store.getState().present.hierarchyLevels[2]).toEqual({ 0: hierarchyLevel })
  })
})

describe('deleteBook', () => {
  it('should remove the hierarchy levels for that book', () => {
    const store = initialStore()
    store.dispatch(deleteBook(1))
    expect(store.getState().present.hierarchyLevels[1]).toBeUndefined()
    expect(store.getState().present.hierarchyLevels[2]).toBeDefined()
  })
})

describe('setHierarchyLevels', () => {
  describe('given a file with hierarchy levels for all books', () => {
    it('should only overwrite the levels for the current book', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(
        editHierarchyLevel({
          level: 0,
          color: 'blue',
        })
      )
      expect(store.getState().present.hierarchyLevels[2]).toEqual(initialState.hierarchyLevels[2])
      const resultLevel = store.getState().present.hierarchyLevels[1][0]
      const initialLevel = initialState.hierarchyLevels[1][0]
      expect(omit(resultLevel, 'color')).toEqual(omit(initialLevel, 'color'))
      expect(resultLevel.color).toEqual('blue')
    })
  })
})
