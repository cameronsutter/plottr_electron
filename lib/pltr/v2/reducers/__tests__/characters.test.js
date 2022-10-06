import { configureStore } from './testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import {
  addCharacter,
  createCharacterAttribute,
  editCharacterTemplateAttribute,
} from '../../actions/characters'
import { removeSystemKeys } from '../systemReducers'

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

describe('editCharacterTemplateAttribute', () => {
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(
        editCharacterTemplateAttribute(
          1,
          'dummy-id',
          'dummy-attribute',
          'characters/1/dummy-id/dummy-attribute'
        )
      )
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
})

describe('addTag', () => {
  
})

describe('addBook', () => {
  
})

describe('removeTag', () => {
  
})

describe('removeBook', () => {
  
})

describe('createCharacterAttribute', () => {
  
})

describe('editCharacterAttributeValue', () => {
  
})

describe('editShortDescription', () => {
  
})

describe('editDescription', () => {
  
})

describe('editCategory', () => {
  
})

describe('deleteBook', () => {
  
})

describe('deleteCharacterCategory', () => {
  
})

describe('deleteTag', () => {
  
})
