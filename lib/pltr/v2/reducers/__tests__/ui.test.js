import { configureStore } from './fixtures/testStore'
import {
  goldilocks,
  hamlet,
  hamlet_with_attribute_mix,
  hamlet_with_partial_attr_ordering,
} from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { editCharacterAttributeMetadata } from '../../actions/attributes'

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
  describe('given a file with a mix of legacy and new character custom attributes', () => {
    describe('and no ordering for those attributes', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_attribute_mix,
            hamlet_with_attribute_mix.file.version,
            'device://tmp/dummy-hamlet.pltr'
          )
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              id: 1,
              type: 'attributes',
            },
            {
              id: 2,
              type: 'attributes',
            },
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
          ],
        })
      })
    })
    describe('and a partial ordering for those attributes (i.e. the ordering lacks some attributes)', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_partial_attr_ordering,
            hamlet_with_partial_attr_ordering.file.version,
            'device://tmp/dummy-hamlet.pltr'
          )
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              id: 1,
              type: 'attributes',
            },
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
              id: 2,
              type: 'attributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
})

describe('editAttributeMetadata', () => {
  describe('given a state with legacy attributes', () => {
    describe('when editing the name of a legacy attribute', () => {
      it('should update the order entry to reflect the name change', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device://tmp/dummy-hamlet.pltr')
        )
        store.dispatch(editCharacterAttributeMetadata(null, 'New Name', 'paragraph', 'Role'))
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              name: 'New Name',
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
