import {
  convertUnicode,
  addToScrivx,
  startNewScrivx,
  buildTagsString,
  buildTemplateProperties,
  createFolderBinderItem,
  resetId,
  createTextBinderItem,
  buildDescriptionFromObject,
  isPropertyEmpty,
} from '../utils'

describe('scrivener export utils', () => {
  describe('convertUnicode', () => {
    it('returns the same character when the char code is less than 255', () => {
      expect(convertUnicode('a')).toEqual('a')
    })

    it('returns the rtf unicode escape sequence for characters with char code > 255 and < 32768', () => {
      const charCode = 8000
      const character = String.fromCharCode(charCode)
      expect(convertUnicode(character)).toEqual(`\\uc1\\u${charCode}*`)
    })

    it('returns the rtf unicode escape sequence for characters with char code > 32768', () => {
      const charCode = 40000
      const character = String.fromCharCode(charCode)
      expect(convertUnicode(character)).toEqual(`\\uc1\\u${charCode - 65536}*`)
    })
  })

  describe('addToScrivx', () => {
    const binderItem = {}
    let scrivx
    beforeEach(() => {
      scrivx = startNewScrivx()
    })

    it('adds binder items to main', () => {
      addToScrivx(scrivx, binderItem, 'main')
      expect(scrivx.ScrivenerProject.Binder.BinderItem[0].Children.BinderItem[0]).toEqual(
        binderItem
      )
    })

    it('adds binder items to research', () => {
      addToScrivx(scrivx, binderItem, 'research')
      expect(scrivx.ScrivenerProject.Binder.BinderItem[1].Children.BinderItem[0]).toEqual(
        binderItem
      )
    })

    it('adds binder items to trash', () => {
      addToScrivx(scrivx, binderItem, 'trash')
      expect(scrivx.ScrivenerProject.Binder.BinderItem[2].Children.BinderItem[0]).toEqual(
        binderItem
      )
    })

    it('adds an array of binder items', () => {
      const secondBinderItem = {}
      addToScrivx(scrivx, [binderItem, secondBinderItem], 'main')
      expect(scrivx.ScrivenerProject.Binder.BinderItem[0].Children.BinderItem).toEqual([
        binderItem,
        secondBinderItem,
      ])
    })
  })

  describe('buildTagsString', () => {
    const state = {
      tags: [
        {
          color: 'firebrick',
          id: 0,
          title: 'awesomeness',
        },
        {
          color: 'crimson',
          id: 1,
          title: 'sad',
        },
      ],
    }
    it('builds a string of tag titles', () => {
      // 1 intentionally included even though there is no tag
      expect(buildTagsString([0, 1], state)).toEqual('awesomeness, sad')
    })

    it('gracefully handles missing tags', () => {
      expect(buildTagsString([1, 2], state)).toEqual('sad')
    })
  })

  describe('buildTemplateProperties', () => {
    const templates = [
      {
        attributes: [
          {
            name: 'attribute',
            type: 'text',
            value: 'So attributey',
          },
          {
            name: 'template',
            type: 'text',
            value: 'So templatey',
          },
          {
            name: 'empty',
            type: 'text',
            value: '',
          },
        ],
      },
    ]

    it('builds an object of key values from templates', () => {
      expect(buildTemplateProperties(templates)).toEqual({
        attribute: 'So attributey',
        template: 'So templatey',
        empty: '',
      })
    })
  })

  describe('createFolderBinderItem', () => {
    // reset id
    beforeAll(() => resetId())
    it('creates a binderItem', () => {
      expect(createFolderBinderItem('Some text')).toMatchObject({
        id: 3,
        binderItem: {
          _attributes: {
            ID: 3,
            Type: 'Folder',
          },
          Title: {
            _text: 'Some text',
          },
        },
      })
    })

    it('increments the id', () => {
      expect(createFolderBinderItem('text').id).toEqual(4)
    })
  })

  describe('createTextBinderItem', () => {
    //reset id
    beforeAll(() => resetId())
    it('creates a binderItem', () => {
      expect(createTextBinderItem('The text')).toMatchObject({
        id: 3,
        binderItem: {
          _attributes: {
            ID: 3,
          },
          Title: {
            _text: 'The text',
          },
        },
      })
    })

    it('increments the id', () => {
      expect(createTextBinderItem('moar text').id).toEqual(4)
    })
  })

  describe('buildDescriptionFromObject', () => {
    it('builds a rich text description from key values', () => {
      const description = buildDescriptionFromObject({
        key: 'value',
        attribute: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'property',
              },
            ],
          },
        ],
      })
      expect(description).toEqual([
        {
          type: 'heading-two',
          children: [
            {
              text: 'key',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'value',
            },
          ],
        },
        {
          type: 'heading-two',
          children: [
            {
              text: 'attribute',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'property',
            },
          ],
        },
      ])
    })

    it('does not include empty properties', () => {
      const description = buildDescriptionFromObject({
        key: 'value',
        attribute: [{}],
        property: '',
      })
      expect(description).toEqual([
        {
          type: 'heading-two',
          children: [
            {
              text: 'key',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'value',
            },
          ],
        },
      ])
    })
  })

  describe('isPropertyEmpty', () => {
    it('returns true when the value is falsy', () => {
      expect(isPropertyEmpty(null)).toEqual(true)
      expect(isPropertyEmpty(undefined)).toEqual(true)
      expect(isPropertyEmpty('')).toEqual(true)
    })

    it('returns false if the value is a primitive type', () => {
      expect(isPropertyEmpty(1)).toEqual(false)
      expect(isPropertyEmpty('a')).toEqual(false)
    })

    it('returns true if the value is empty RichContent', () => {
      expect(isPropertyEmpty([{}])).toEqual(true)
    })

    it('returns false if the value is RichContent', () => {
      expect(
        isPropertyEmpty([
          {
            type: 'paragraph',
            children: [
              {
                text: 'asdf',
              },
            ],
          },
        ])
      ).toEqual(false)
    })
  })
})
