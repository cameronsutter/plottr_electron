import { emptyFile } from 'pltr/v2'

import exportCharacters from '../characters'
import { resetId } from '../../utils'
import {
  state,
  goldilocks,
  file_with_two_characters_and_two_books_with_book_associations,
} from './fixtures'
import { headingTwo, paragraph } from 'components/__fixtures__'
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
          exportCharacters(goldilocks, documentContents, {
            ...default_config.scrivener,
            characers: {
              ...default_config.scrivener.characters,
              export: false,
            },
          })
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
})
