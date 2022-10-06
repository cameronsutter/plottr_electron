import { configureStore } from './testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import {
  addCharacter,
  addTemplateToCharacter,
  createCharacterAttribute,
  editCharacterTemplateAttribute,
} from '../../actions/characters'
import { removeSystemKeys } from '../systemReducers'
import { singleCharacterSelector } from '../../selectors/characters'

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

const A_CHARACTER_TEMPLATE = {
  id: 'ch2',
  type: 'characters',
  name: 'Enneagram',
  description: 'Personality types',
  link: 'https://www.enneagraminstitute.com/type-descriptions',
  version: '2022.7.20',
  attributes: [
    {
      name: 'Type',
      type: 'text',
      description: 'Type of personality based on the Enneagram test',
    },
    {
      name: 'Core Desire',
      type: 'text',
    },
    {
      name: 'Core Fear',
      type: 'text',
    },
  ],
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
          'dummy-value',
          'characters/1/dummy-id/dummy-attribute'
        )
      )
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a characters', () => {
    describe('but no templates applied to that character', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(
          editCharacterTemplateAttribute(
            1,
            'dummy-id',
            'dummy-attribute',
            'dummy-value',
            'characters/1/dummy-id/dummy-attribute'
          )
        )
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('a template applied to that character', () => {
      describe('and the id of an attribute in that template', () => {
        it('should change the value of that attribute', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
          const initialState = removeSystemKeys(store.getState().present)
          const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
          expect(initialTemplate).toEqual({
            attributes: [
              {
                description: 'Type of personality based on the Enneagram test',
                name: 'Type',
                type: 'text',
              },
              {
                name: 'Core Desire',
                type: 'text',
              },
              {
                name: 'Core Fear',
                type: 'text',
              },
            ],
            id: 'ch2',
            value: '',
            version: '2022.7.20',
          })
          store.dispatch(
            editCharacterTemplateAttribute(
              1,
              'ch2',
              'Type',
              'New value',
              'characters/1/dummy-id/dummy-attribute'
            )
          )
          const resultState = removeSystemKeys(store.getState().present)
          const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
          expect(resultTemplate).toEqual({
            attributes: [
              {
                description: 'Type of personality based on the Enneagram test',
                name: 'Type',
                type: 'text',
              },
              {
                name: 'Core Desire',
                type: 'text',
              },
              {
                name: 'Core Fear',
                type: 'text',
              },
            ],
            id: 'ch2',
            value: '',
            version: '2022.7.20',
            values: [
              {
                bookId: 'all',
                name: 'Type',
                value: 'New value',
              },
            ],
          })
        })
      })
      describe('and an id for an attribute *not* in that template', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
          const initialState = removeSystemKeys(store.getState().present)
          const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
          expect(initialTemplate).toEqual({
            attributes: [
              {
                description: 'Type of personality based on the Enneagram test',
                name: 'Type',
                type: 'text',
              },
              {
                name: 'Core Desire',
                type: 'text',
              },
              {
                name: 'Core Fear',
                type: 'text',
              },
            ],
            id: 'ch2',
            value: '',
            version: '2022.7.20',
          })
          store.dispatch(
            editCharacterTemplateAttribute(
              1,
              'ch2',
              'Typo', // Note the typo! ;)
              'New value',
              'characters/1/dummy-id/dummy-attribute'
            )
          )
          const resultState = removeSystemKeys(store.getState().present)
          const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
          expect(resultTemplate).toEqual(initialTemplate)
        })
      })
    })
  })
})

describe('addTag', () => {})

describe('addBook', () => {})

describe('removeTag', () => {})

describe('removeBook', () => {})

describe('createCharacterAttribute', () => {})

describe('editCharacterAttributeValue', () => {})

describe('editShortDescription', () => {})

describe('editDescription', () => {})

describe('editCategory', () => {})

describe('deleteBook', () => {})

describe('deleteCharacterCategory', () => {})

describe('deleteTag', () => {})
