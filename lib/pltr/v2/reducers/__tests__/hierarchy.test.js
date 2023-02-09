import { omit } from 'lodash'

import { configureStore } from './fixtures/testStore'
import { post_multi_hierarchy_zelda } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { addBook, deleteBook } from '../../actions/books'
import { changeCurrentTimeline } from '../../actions/ui'

import { editHierarchyLevel, setHierarchyLevels } from '../../actions/hierarchy'
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
  store.dispatch(changeCurrentTimeline(1))
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

describe('modifying the hierarchy', () => {
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
    describe('when changing the book to 2', () => {
      it("should change that book's hierarchy instead", () => {
        const store = initialStore()
        const initialState = store.getState().present
        store.dispatch(changeCurrentTimeline(2))
        store.dispatch(
          editHierarchyLevel({
            level: 0,
            color: 'blue',
          })
        )
        expect(store.getState().present.hierarchyLevels[1]).toEqual(initialState.hierarchyLevels[1])
        const resultLevel = store.getState().present.hierarchyLevels[2][0]
        const initialLevel = initialState.hierarchyLevels[2][0]
        expect(omit(resultLevel, 'color')).toEqual(omit(initialLevel, 'color'))
        expect(resultLevel.color).toEqual('blue')
      })
    })
    describe('when there are multiple levels in the current book', () => {
      it('should change the appropriate level', () => {
        const store = initialStore()
        store.dispatch(setHierarchyLevels([hierarchyLevel, hierarchyLevel]))
        const initialState = store.getState().present
        store.dispatch(
          editHierarchyLevel({
            level: 1,
            color: 'blue',
          })
        )
        expect(store.getState().present.hierarchyLevels[2]).toEqual(initialState.hierarchyLevels[2])
        const resultLevel = store.getState().present.hierarchyLevels[1][1]
        const initialLevel = initialState.hierarchyLevels[1][1]
        expect(omit(resultLevel, 'color')).toEqual(omit(initialLevel, 'color'))
        expect(resultLevel.color).toEqual('blue')
      })
    })
    describe('when attempting to set the levels to empty', () => {
      it('should leave the state as-is (this is ilegal)', () => {
        const store = initialStore()
        const initialState = store.getState().present
        store.dispatch(setHierarchyLevels([]))
        expect(store.getState().present.hierarchyLevels).toEqual(initialState.hierarchyLevels)
      })
    })
    describe('when attempting to set the levels to more than three', () => {
      it('should leave the state as-is (this is ilegal)', () => {
        const store = initialStore()
        const initialState = store.getState().present
        store.dispatch(
          setHierarchyLevels([hierarchyLevel, hierarchyLevel, hierarchyLevel, hierarchyLevel])
        )
        expect(store.getState().present.hierarchyLevels).toEqual(initialState.hierarchyLevels)
      })
    })
  })
  describe('when going from 1 to 2 levels', () => {
    it('should default the lowest level name to "scene" when both levels would be "chapter"', () => {
      const store = initialStore()
      const initialHierarchyLevelName = store.getState().present.hierarchyLevels[1][0].name
      expect(initialHierarchyLevelName).toEqual('Chapter')
      store.dispatch(setHierarchyLevels([hierarchyLevel, hierarchyLevel]))
      const resultHierarcyhLevels = store.getState().present.hierarchyLevels[1]
      expect(resultHierarcyhLevels[0].name).not.toEqual(resultHierarcyhLevels[1].name)
      expect(resultHierarcyhLevels[0].name).toEqual('Chapter')
      expect(resultHierarcyhLevels[1].name).toEqual('Scene')
    })
  })
})
