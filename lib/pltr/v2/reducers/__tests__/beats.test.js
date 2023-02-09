import { configureStore } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { addBook } from '../../actions/books'
import { changeCurrentTimeline } from '../../actions/ui'
import { setHierarchyLevels } from '../../actions/hierarchy'
import { hierarchyLevel } from '../../store/initialState'
import { maxDepth } from '../tree'

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

describe('modifying the hierarchy (and its impact on beats)', () => {
  describe('when the level count does not change', () => {
    it('should not change the beats state', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(setHierarchyLevels([{ 0: hierarchyLevel }]))
      expect(store.getState().present.beats).toBe(initialState.beats)
    })
  })
  describe('when the level count is set to more than three', () => {
    it('should not change the beats state', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(
        setHierarchyLevels([
          { 0: hierarchyLevel },
          { 0: hierarchyLevel },
          { 0: hierarchyLevel },
          { 0: hierarchyLevel },
        ])
      )
      expect(store.getState().present.beats).toBe(initialState.beats)
    })
  })
  describe('when the level count is set to less than one', () => {
    it('should not change the beats state', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(setHierarchyLevels([]))
      expect(store.getState().present.beats).toBe(initialState.beats)
    })
  })
  describe('when the level count does change', () => {
    describe('and the current timeline is book 1', () => {
      it('should adjust the number of levels of beats in book 1', () => {
        const store = initialStore()
        const initialState = store.getState().present
        store.dispatch(setHierarchyLevels([{ 0: hierarchyLevel }, { 0: hierarchyLevel }]))
        expect(maxDepth('id')(store.getState().present.beats[1])).toBeGreaterThan(
          maxDepth('id')(initialState.beats[1])
        )
        expect(maxDepth('id')(store.getState().present.beats[1])).toEqual(1)
      })
    })
    describe('and the current timeline is book 2', () => {
      it('should adjust the number of levels of beats in book 2', () => {
        const store = initialStore()
        const initialState = store.getState().present
        store.dispatch(changeCurrentTimeline(2))
        store.dispatch(setHierarchyLevels([{ 0: hierarchyLevel }, { 0: hierarchyLevel }]))
        expect(maxDepth('id')(store.getState().present.beats[2])).toBeGreaterThan(
          maxDepth('id')(initialState.beats[2])
        )
        expect(maxDepth('id')(store.getState().present.beats[2])).toEqual(1)
      })
    })
  })
})
