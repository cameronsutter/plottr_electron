import { emptyFile } from 'pltr/v2'
import default_export_config from '../../../default_config'

import { goldilocks } from './fixtures'
import { characterDataExportDirectives } from '../characters'

const EMPTY_FILE = emptyFile('Test file')

describe('characterDataExportDirectives', () => {
  describe('given an empty new file', () => {
    it('should produce an empty category', () => {
      expect(characterDataExportDirectives(EMPTY_FILE, default_export_config.word)).toEqual([
        { alignment: 'center', heading: 'Heading1', type: 'paragraph', text: 'Characters' },
      ])
    })
    describe('with characters turned off', () => {
      it('should not export anything', () => {
        expect(
          characterDataExportDirectives(EMPTY_FILE, {
            ...default_export_config.word,
            characters: {
              ...default_export_config.word.characters,
              export: false,
            },
          })
        ).toEqual([])
      })
    })
  })
  describe('given the goldilocks example file', () => {
    describe('which does not have characters associated to books', () => {
      describe('nor does it have multiple books', () => {
        it('should nevertheless export all characters as though they were all associated with the only book', () => {
          expect(characterDataExportDirectives(goldilocks, default_export_config.word)).toEqual([
            { alignment: 'center', heading: 'Heading1', type: 'paragraph', text: 'Characters' },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Goldilocks',
              type: 'paragraph',
            },
            {
              imageId: '1',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Main',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Human',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Human',
                bookIds: [],
                cards: [1, 2, 6, 7, 3, 4, 5, 11],
                categoryId: '1',
                color: null,
                description: '',
                id: 1,
                imageId: '1',
                name: 'Goldilocks',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Baby Bear',
              type: 'paragraph',
            },
            {
              imageId: '2',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Main',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Bear',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Bear',
                bookIds: [],
                cards: [3, 4, 11],
                categoryId: '1',
                color: null,
                description: '',
                id: 2,
                imageId: '2',
                name: 'Baby Bear',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Papa Bear',
              type: 'paragraph',
            },
            {
              imageId: '4',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Supporting',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Bear',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Bear',
                bookIds: [],
                cards: [3, 4, 11],
                categoryId: '2',
                color: null,
                description: '',
                id: 3,
                imageId: '4',
                name: 'Papa Bear',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Mama Bear',
              type: 'paragraph',
            },
            {
              imageId: '3',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Supporting',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Bear',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Bear',
                bookIds: [],
                cards: [3, 4, 11],
                categoryId: '2',
                color: null,
                description: '',
                id: 4,
                imageId: '3',
                name: 'Mama Bear',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
          ])
        })
      })
    })
  })
})
