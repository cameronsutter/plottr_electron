import { configureStore } from './testStore'
import { emptyFile } from '../../store/newFileState'
import { loadFile, selectCharacterAttributeBookTab } from '../../actions/ui'
import {
  addCharacter,
  addTemplateToCharacter,
  createCharacterAttribute,
  editCharacterTemplateAttribute,
  addBook as addBookToCharacter,
  addTag as addTagToCharacter,
  removeTag as removeTagFromCharacter,
  removeBook as removeBookFromCharacter,
} from '../../actions/characters'
import { removeSystemKeys } from '../systemReducers'
import { singleCharacterSelector } from '../../selectors/characters'
import { addBook } from '../../actions/books'
import { selectedCharacterAttributeTabSelector } from '../../selectors/ui'
import { addTag } from '../../actions/tags'

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
  describe('given a store with a character', () => {
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
      describe('the id of an attribute that *is* in the template', () => {
        describe('when the attribute is not yet modified', () => {
          it('should add that attribute', () => {
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
              values: [
                {
                  bookId: 'all',
                  name: 'Type',
                  value: 'New value',
                },
              ],
              version: '2022.7.20',
            })
          })
        })
        describe('when the attribute is already there', () => {
          it('should modify that attribute', () => {
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
            store.dispatch(
              editCharacterTemplateAttribute(
                1,
                'ch2',
                'Type',
                'Next value',
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
              values: [
                {
                  bookId: 'all',
                  name: 'Type',
                  value: 'Next value',
                },
              ],
              version: '2022.7.20',
            })
          })
        })
        describe('when the attribute is in another book', () => {
          describe('if tabs should not be shown', () => {
            it('should modify the all version of the attribute', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
              store.dispatch(addBook())
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
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(
                editCharacterTemplateAttribute(
                  1,
                  'ch2',
                  'Type',
                  'Next value',
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
                values: [
                  {
                    bookId: 'all',
                    name: 'Type',
                    value: 'Next value',
                  },
                ],
                version: '2022.7.20',
              })
            })
          })
          describe('if tabs should be shown', () => {
            it('should add another template value for the current book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
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
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(
                editCharacterTemplateAttribute(
                  1,
                  'ch2',
                  'Type',
                  'Next value',
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
                values: [
                  {
                    bookId: 'all',
                    name: 'Type',
                    value: 'New value',
                  },
                  {
                    bookId: '1',
                    name: 'Type',
                    value: 'Next value',
                  },
                ],
                version: '2022.7.20',
              })
            })
          })
        })
      })
    })
  })
})

describe('addTag', () => {
  describe('given a store with no characters and no tags', () => {
    it('should add a base attribute for tags to the attributes collection', () => {
      const store = initialStore()
      store.dispatch(addTagToCharacter(1, 1))
      expect(ignoringChangesWeDontCareAbout(store.getState().present).attributes).toEqual({
        characters: [
          {
            bookId: 'all',
            id: 1,
            name: 'tags',
            type: 'base-attribute',
          },
        ],
      })
    })
  })
  describe('given a store with a character', () => {
    describe('and no tags', () => {
      it('should a base attribute for tags to the attributes collection', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addTagToCharacter(1, 1))
        expect(ignoringChangesWeDontCareAbout(store.getState().present).attributes).toEqual({
          characters: [
            {
              bookId: 'all',
              id: 1,
              name: 'tags',
              type: 'base-attribute',
            },
          ],
        })
      })
    })
    describe('and only one book', () => {
      describe('when book one tab is selected', () => {
        it('should apply the tag to the "all" book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          expect(singleCharacterSelector(store.getState().present, 1).attributes).toBeUndefined()
          store.dispatch(selectCharacterAttributeBookTab('1'))
          store.dispatch(addTagToCharacter(1, 1))
          const resultState = removeSystemKeys(store.getState().present)
          expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
            {
              id: 1,
              value: [1],
            },
          ])
          expect(ignoringChangesWeDontCareAbout(resultState).attributes).toEqual({
            characters: [
              {
                bookId: 'all',
                id: 1,
                name: 'tags',
                type: 'base-attribute',
              },
            ],
          })
        })
      })
      describe('when the "all" book tab is selected', () => {
        it('should apply the tag to the "all" book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          expect(singleCharacterSelector(store.getState().present, 1).attributes).toBeUndefined()
          store.dispatch(selectCharacterAttributeBookTab('all'))
          store.dispatch(addTagToCharacter(1, 1))
          const resultState = removeSystemKeys(store.getState().present)
          expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
            {
              id: 1,
              value: [1],
            },
          ])
          expect(ignoringChangesWeDontCareAbout(resultState).attributes).toEqual({
            characters: [
              {
                bookId: 'all',
                id: 1,
                name: 'tags',
                type: 'base-attribute',
              },
            ],
          })
        })
      })
    })
    describe('and two books', () => {
      describe('when no book is associated with the character', () => {
        it('should add the tag to the "all" book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          expect(singleCharacterSelector(store.getState().present, 1).attributes).toBeUndefined()
          store.dispatch(selectCharacterAttributeBookTab('all'))
          store.dispatch(addTagToCharacter(1, 1))
          const resultState = removeSystemKeys(store.getState().present)
          expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
            {
              id: 1,
              value: [1],
            },
          ])
          expect(ignoringChangesWeDontCareAbout(resultState).attributes).toEqual({
            characters: [
              {
                bookId: 'all',
                id: 1,
                name: 'tags',
                type: 'base-attribute',
              },
            ],
          })
        })
      })
      describe('when a book is associated with the character', () => {
        describe('and the  "all" tab is selected', () => {
          it('should add the tag to the "all" book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTag())
            expect(singleCharacterSelector(store.getState().present, 1).attributes).toBeUndefined()
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            store.dispatch(selectCharacterAttributeBookTab('all'))
            store.dispatch(addTagToCharacter(1, 1))
            const resultState = removeSystemKeys(store.getState().present)
            expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
              {
                id: 1,
                value: [1],
              },
            ])
            expect(ignoringChangesWeDontCareAbout(resultState).attributes).toEqual({
              characters: [
                {
                  bookId: 'all',
                  id: 1,
                  name: 'tags',
                  type: 'base-attribute',
                },
              ],
            })
          })
        })
        describe('and the first book is selected', () => {
          it('should add the tag to the first book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTag())
            expect(singleCharacterSelector(store.getState().present, 1).attributes).toBeUndefined()
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            store.dispatch(selectCharacterAttributeBookTab('1'))
            store.dispatch(addTagToCharacter(1, 1))
            const resultState = removeSystemKeys(store.getState().present)
            expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
              {
                id: 1,
                value: [1],
              },
            ])
            expect(ignoringChangesWeDontCareAbout(resultState).attributes).toEqual({
              characters: [
                {
                  bookId: '1',
                  id: 1,
                  name: 'tags',
                  type: 'base-attribute',
                },
              ],
            })
          })
        })
      })
    })
  })
})

describe('addBook', () => {
  describe('given a state with no characters', () => {
    it('leave the state un changed', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(addBookToCharacter(1, 1))
      expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
        ignoringChangesWeDontCareAbout(initialState)
      )
    })
  })
  describe('given a state with a character', () => {
    describe('and a different character id', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(2, 1))
        expect(singleCharacterSelector(store.getState().present, 1).bookIds).toEqual([])
      })
    })
    describe('and that characters id', () => {
      it('should add the book to that character', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        expect(singleCharacterSelector(store.getState().present, 1).bookIds).toEqual([1])
      })
      describe('and a book id that does not exist', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          const initialState = store.getState().present
          store.dispatch(addBookToCharacter(1, 2))
          expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
            ignoringChangesWeDontCareAbout(initialState)
          )
        })
      })
    })
  })
})

describe('removeTag', () => {
  describe('given a state with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(removeTagFromCharacter(1, 1))
      expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
        ignoringChangesWeDontCareAbout(initialState)
      )
    })
  })
  describe('given a state with a character', () => {
    describe('and no tags', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState().present
        store.dispatch(removeTagFromCharacter(1, 1))
        expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
          ignoringChangesWeDontCareAbout(initialState)
        )
      })
    })
    describe('and a tag', () => {
      describe('but the tag is not associated with the character', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addTag())
          store.dispatch(addCharacter('John Doe'))
          const initialState = store.getState().present
          store.dispatch(removeTagFromCharacter(1, 1))
          expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
            ignoringChangesWeDontCareAbout(initialState)
          )
        })
      })
      describe('and the tag is associated with the character', () => {
        it('should remove the tag from the character', () => {
          const store = initialStore()
          store.dispatch(addTag())
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTagToCharacter(1, 1))
          store.dispatch(removeTagFromCharacter(1, 1))
          expect(singleCharacterSelector(store.getState().present, 1).attributes).toEqual([
            { id: 1, value: [] },
          ])
          expect(store.getState().present.attributes).toEqual({
            characters: [{ id: 1, type: 'base-attribute', name: 'tags', bookId: 'all' }],
          })
        })
        describe('when the tag is associated in both book 1 and "all"', () => {
          describe('and book 1 is selected', () => {
            it('should remove the tag from book 1', () => {
              const store = initialStore()
              store.dispatch(addTag())
              store.dispatch(addBook())
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTagToCharacter(1, 1))
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(addTagToCharacter(1, 1))
              expect(singleCharacterSelector(store.getState().present, 1).attributes).toEqual([
                { id: 1, value: [1] },
                { id: 2, value: [1] },
              ])
              store.dispatch(removeTagFromCharacter(1, 1))
              expect(singleCharacterSelector(store.getState().present, 1).attributes).toEqual([
                { id: 1, value: [1] },
                { id: 2, value: [] },
              ])
              expect(store.getState().present.attributes).toEqual({
                characters: [
                  { id: 1, type: 'base-attribute', name: 'tags', bookId: 'all' },
                  {
                    bookId: '1',
                    id: 2,
                    name: 'tags',
                    type: 'base-attribute',
                  },
                ],
              })
            })
          })
          describe('and the "all" book is selected', () => {
            it('should remove the tag from the "all" book', () => {
              const store = initialStore()
              store.dispatch(addTag())
              store.dispatch(addBook())
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTagToCharacter(1, 1))
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(addTagToCharacter(1, 1))
              expect(singleCharacterSelector(store.getState().present, 1).attributes).toEqual([
                { id: 1, value: [1] },
                { id: 2, value: [1] },
              ])
              store.dispatch(selectCharacterAttributeBookTab('all'))
              store.dispatch(removeTagFromCharacter(1, 1))
              expect(singleCharacterSelector(store.getState().present, 1).attributes).toEqual([
                { id: 1, value: [] },
                { id: 2, value: [1] },
              ])
              expect(store.getState().present.attributes).toEqual({
                characters: [
                  { id: 1, type: 'base-attribute', name: 'tags', bookId: 'all' },
                  {
                    bookId: '1',
                    id: 2,
                    name: 'tags',
                    type: 'base-attribute',
                  },
                ],
              })
            })
          })
        })
      })
    })
  })
})

describe('removeBook', () => {
  describe('given a state with no characters', () => {
    it('leave the state un changed', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(removeBookFromCharacter(1, 1))
      expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
        ignoringChangesWeDontCareAbout(initialState)
      )
    })
  })
  describe('given a state with a character', () => {
    describe('and no books associated with that character', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState().present
        store.dispatch(removeBookFromCharacter(1, 1))
        expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
          ignoringChangesWeDontCareAbout(initialState)
        )
      })
    })
    describe('and a book associated with that character', () => {
      describe('and that book id', () => {
        it('should remove it from the character', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          store.dispatch(removeBookFromCharacter(1, 1))
          expect(singleCharacterSelector(store.getState().present, 1).bookIds).toEqual([])
        })
      })
      describe('and a different book id', () => {
        it('should leave the state un changed', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          expect(singleCharacterSelector(store.getState().present, 1).bookIds).toEqual([1])
          store.dispatch(removeBookFromCharacter(1, 2))
          expect(singleCharacterSelector(store.getState().present, 1).bookIds).toEqual([1])
        })
      })
    })
    describe('and that characters id', () => {
      it('should add the book to that character', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        expect(singleCharacterSelector(store.getState().present, 1).bookIds).toEqual([1])
      })
      describe('and a book id that does not exist', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          const initialState = store.getState().present
          store.dispatch(addBookToCharacter(1, 2))
          expect(ignoringChangesWeDontCareAbout(store.getState().present)).toEqual(
            ignoringChangesWeDontCareAbout(initialState)
          )
        })
      })
    })
  })
})

describe('createCharacterAttribute', () => {
  describe('given a state with no characters', () => {
    it('should not change the character state', () => {
      const store = initialStore()
      const initialState = store.getState().present
      store.dispatch(
        createCharacterAttribute({
          type: 'text',
          name: 'strength',
        })
      )
      expect(ignoringChangesWeDontCareAbout(store.getState().present).characters).toEqual(
        ignoringChangesWeDontCareAbout(initialState).characters
      )
    })
  })
  describe('given a state with a character', () => {
    it('should and and default the value of the new attribute to the character', () => {
      const store = initialStore()
      store.dispatch(addCharacter('John Doe'))
      store.dispatch(
        createCharacterAttribute({
          type: 'text',
          name: 'strength',
        })
      )
      expect(singleCharacterSelector(store.getState().present, 1).attributes).toEqual([
        {
          id: 1,
          value: undefined,
        },
      ])
    })
  })
})

describe('editCharacterAttributeValue', () => {})

describe('editShortDescription', () => {})

describe('editDescription', () => {})

describe('editCategory', () => {})

describe('deleteBook', () => {})

describe('deleteCharacterCategory', () => {})

describe('deleteTag', () => {})
