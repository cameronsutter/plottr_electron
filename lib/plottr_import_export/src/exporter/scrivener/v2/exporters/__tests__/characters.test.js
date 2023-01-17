import { emptyFile } from 'pltr/v2'

import exportCharacters from '../characters'
import { resetId } from '../../utils'
import {
  state,
  goldilocks,
  file_with_two_characters_and_two_books_with_book_associations,
} from './fixtures'
import { headingTwo, paragraph } from '../../../../../app/components/__fixtures__'
import default_config from '../../../../default_config'

describe('exportCharacters', () => {
  beforeEach(() => resetId())

  it('exports characters binder from state', () => {
    const documentContents = {}
    const binderItem = exportCharacters(state, documentContents, default_config.scrivener)
    // there are 2 characters in the test state but the second one is part of book 2
    // so it shouldn't show up here
    expect(binderItem).toMatchObject({
      _attributes: {
        Type: 'Folder',
      },
      Title: {
        _text: 'Characters',
      },
      Children: {
        BinderItem: [
          {
            _attributes: {
              Type: 'Text',
            },
            Title: {
              _text: 'Father',
            },
          },
        ],
      },
    })
  })

  it('exports the documentContents', () => {
    const documentContents = {}
    const _binderItem = exportCharacters(state, documentContents, default_config.scrivener)
    // NOTE: description and notes are no longer in this test because
    // we changed how descriptions and notes are exported per book
    // with the new feature.  The root-level legacy attributes only
    // apply to the 'all'/'series' book.  We're exporting book one
    // here.
    expect(documentContents).toEqual({
      4: {
        body: {
          docTitle: 'Father',
          description: [
            headingTwo('age'),
            paragraph('50s'),
            headingTwo('stuff'),
            paragraph('something'),
            headingTwo('An attribute'),
            paragraph('Which attributes'),
          ],
        },
      },
    })
  })

  describe('given an empty new file', () => {
    it('should produce nothing', () => {
      const EMPTY_FILE = emptyFile('Test file')

      const documentContents = {}
      exportCharacters(EMPTY_FILE, documentContents, default_config.scrivener)
      expect(documentContents).toEqual({})
    })
    describe('with characters turn off', () => {
      it('should produce nothing', () => {
        const EMPTY_FILE = emptyFile('Test file')

        const documentContents = {}
        exportCharacters(EMPTY_FILE, documentContents, {
          ...default_config.scrivener,
          characers: {
            ...default_config.scrivener.characters,
            export: false,
          },
        })
        expect(documentContents).toEqual({})
      })
    })
  })
  describe('given the goldilocks example file', () => {
    describe('which does not have characters associated to books', () => {
      describe('nor does it have multiple books', () => {
        it('should nevertheless export all characters as though they were all associated with the only book', () => {
          const documentContents = {}
          exportCharacters(goldilocks, documentContents, default_config.scrivener)
          expect(documentContents).toEqual({
            4: {
              body: {
                description: [
                  {
                    children: [
                      {
                        text: 'Notes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Species',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Human',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Category',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Main',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                docTitle: 'Goldilocks',
              },
            },
            5: {
              body: {
                description: [
                  {
                    children: [
                      {
                        text: 'Notes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Species',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Category',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Main',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                docTitle: 'Baby Bear',
              },
            },
            6: {
              body: {
                description: [
                  {
                    children: [
                      {
                        text: 'Notes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Species',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Category',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Supporting',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                docTitle: 'Papa Bear',
              },
            },
            7: {
              body: {
                description: [
                  {
                    children: [
                      {
                        text: 'Notes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Species',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Category',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'Supporting',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                docTitle: 'Mama Bear',
              },
            },
          })
        })
      })
    })
  })
  describe('given a file with multiple characters and books', () => {
    describe('when there are associations between characters and books', () => {
      describe('and book 1 is selected', () => {
        it('should only export the character for book 1', () => {
          const documentContents = {}
          exportCharacters(
            file_with_two_characters_and_two_books_with_book_associations,
            documentContents,
            default_config.scrivener
          )
          expect(documentContents).toEqual({
            4: {
              body: {
                description: [
                  {
                    children: [
                      {
                        text: 'Description',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'description 2 test_project',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Notes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'notes 2 test_project',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'attributes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    bookId: 'all',
                    id: 1,
                    value: 'short description 2',
                  },
                  {
                    bookId: 'all',
                    id: 2,
                    value: [
                      {
                        children: [
                          {
                            text: 'notes 2',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    bookId: 'all',
                    id: 3,
                    value: 'text 2',
                  },
                  {
                    bookId: 'all',
                    id: 4,
                    value: [
                      {
                        children: [
                          {
                            text: 'other text 2',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    bookId: 1,
                    id: 3,
                    value: 'attr1 char2 in test_project',
                  },
                  {
                    bookId: 1,
                    id: 4,
                    value: [
                      {
                        children: [
                          {
                            text: 'attr2 char2 in test_project',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    bookId: 1,
                    id: 1,
                    value: 'description 2 test_project',
                  },
                  {
                    bookId: 1,
                    id: 2,
                    value: [
                      {
                        children: [
                          {
                            text: 'notes 2 test_project',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'attr1',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'attr1 char2 in test_project',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'attr2',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'attr2 char2 in test_project',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                docTitle: 'character 2',
              },
            },
          })
        })
      })
      describe('and book 2 is selected', () => {
        it('should only export the character for book 1', () => {
          const documentContents = {}
          exportCharacters(
            {
              ...file_with_two_characters_and_two_books_with_book_associations,
              ui: {
                ...file_with_two_characters_and_two_books_with_book_associations.ui,
                currentTimeline: 2,
              },
            },
            documentContents,
            default_config.scrivener
          )
          expect(documentContents).toEqual({
            4: {
              body: {
                description: [
                  {
                    children: [
                      {
                        text: 'Description',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'description 1 second book',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Notes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'description 1 second book',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'attributes',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    bookId: 'all',
                    id: 1,
                    value: 'short description 1',
                  },
                  {
                    bookId: 'all',
                    id: 2,
                    value: [
                      {
                        children: [
                          {
                            text: 'notes 1',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    bookId: 'all',
                    id: 3,
                    value: 'text',
                  },
                  {
                    bookId: 'all',
                    id: 4,
                    value: [
                      {
                        children: [
                          {
                            text: 'other text',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    bookId: 2,
                    id: 1,
                    value: 'description 1 second book',
                  },
                  {
                    bookId: 2,
                    id: 2,
                    value: [
                      {
                        children: [
                          {
                            text: 'description 1 second book',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    bookId: 2,
                    id: 3,
                    value: 'attr1 character 1 second book',
                  },
                  {
                    bookId: 2,
                    id: 4,
                    value: [
                      {
                        children: [
                          {
                            text: 'attr2 character 1 second book',
                          },
                        ],
                        type: 'paragraph',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'attr1',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'attr1 character 1 second book',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'attr2',
                      },
                    ],
                    type: 'heading-two',
                  },
                  {
                    children: [
                      {
                        text: 'attr2 character 1 second book',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                docTitle: 'character 1',
              },
            },
          })
        })
      })
    })
  })
})
