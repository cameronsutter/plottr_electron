import { configureStore } from './testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import {
  reorderCharacterAttribute,
  deleteCharacterAttribute,
  editCharacterAttributeMetadata,
} from '../../actions/attributes'
import { removeSystemKeys } from '../systemReducers'
import { addCharacter, createCharacterAttribute } from '../../actions/characters'
import { characterAttributesSelector } from '../../selectors/characters'

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

describe('editCharacterAttributeMetadata', () => {
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(editCharacterAttributeMetadata(1, 'John Doe', 'text', 'John Does'))
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(editCharacterAttributeMetadata(1, 'John Doe', 'text', 'John Does'))
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and a character attribute', () => {
      it('should change the details of that attribute', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(editCharacterAttributeMetadata(1, 'height', 'text', 'strength'))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should not change the details of that attribute if the id is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(editCharacterAttributeMetadata(2, 'height', 'text', 'strength'))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
  })
})

describe('deleteCharacterAttribute', () => {
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(deleteCharacterAttribute(1))
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(deleteCharacterAttribute(1))
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and a character attribute', () => {
      it('should delete that attribute', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(deleteCharacterAttribute(1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([])
      })
      it('should not delete that attribute if the id is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(deleteCharacterAttribute(2))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
  })
})

describe('reorderCharacterAttribute', () => {
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(
        reorderCharacterAttribute(
          {
            type: 'text',
            name: 'strength',
          },
          1
        )
      )
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and a character attribute', () => {
      it('should leave that attribute unchanged when the target index is 0', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            0
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          }
        ])
      })
      it('should leave that attribute unchanged when the target index is 1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          }
        ])
      })
      it('should leave that attribute unchanged when the target index is -1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            -1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should not reorder that attribute if the given attribute is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'height',
            },
            1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
    describe('and a two character attributes', () => {
      it('should leave that attribute unchanged when the target index is 0', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'height',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            0
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should move that attribute when the target index is 1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'height',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should leave that attribute unchanged when the target index is -1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'height',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'strength',
            },
            -1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should not reorder that attribute if the given attribute is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'strength',
          })
        )
        store.dispatch(
          createCharacterAttribute({
            type: 'text',
            name: 'height',
          })
        )
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(
          reorderCharacterAttribute(
            {
              type: 'text',
              name: 'weight',
            },
            1
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
  })
})
