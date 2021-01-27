import { createEditor } from '../helpers'
import { handleHeadings, handleList, handleBlockQuote } from '../BlockButton'
import {
  paragraph,
  bulletedList,
  numberedList,
  listItem,
  headingOne,
  headingTwo,
  blockQuote,
} from '../__fixtures__'

describe('BlockButton', () => {
  let editor

  describe('handleHeadings', () => {
    beforeAll(() => {
      editor = createEditor()
      editor.insertNode(paragraph())
    })

    it('Turns an empty paragraph into a heading', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([headingOne()])
    })

    it('Turns an empty heading into a paragraph', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([paragraph()])
    })

    it('Turns a paragraph with text into a heading', () => {
      editor.insertText('Text')
      handleHeadings(editor, 'heading-two')
      expect(editor.children).toEqual([headingTwo('Text')])
    })

    it('Turns one heading into another kind of heading', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([headingOne('Text')])
    })
  })

  describe('handleList', () => {
    beforeAll(() => {
      editor = createEditor()
      editor.insertNode(paragraph())
    })

    // For the reason why it's a paragraph as a child of bullet-list see
    // BlockButton#handleList
    it('turns an empty paragraph into a list', () => {
      handleList(editor, 'bulleted-list')
      expect(editor.children).toEqual([bulletedList()])
    })

    // For the reason why it's a list-item and not a paragraph see
    // BlockButton
    it('turns an empty list back into a paragraph', () => {
      handleList(editor, 'bulleted-list')
      expect(editor.children).toEqual([paragraph()])
    })

    it('turns text into a list', () => {
      editor.insertText('Text')
      handleList(editor, 'bulleted-list')
      expect(editor.children).toEqual([bulletedList([listItem('Text')])])
    })

    it('turns a list back into text', () => {
      handleList(editor, 'bulleted-list')
      expect(editor.children).toEqual([paragraph('Text')])
    })

    describe('various list merging and splitting scenarios', () => {
      const children = [numberedList([listItem('Text'), listItem('Text 2'), listItem('Text 3')])]
      beforeAll(() => {
        editor.children = children
        editor.selection = {
          anchor: { path: [0, 0, 0], offset: 4 },
          focus: { path: [0, 0, 0], offset: 4 },
        }
      })

      it('removes a list item from the top of the list', () => {
        handleList(editor, 'numbered-list')
        expect(editor.children).toEqual([
          paragraph('Text'),
          numberedList([listItem('Text 2'), listItem('Text 3')]),
        ])
      })

      it('adds a list item to the top of the list', () => {
        handleList(editor, 'numbered-list')
        expect(editor.children).toEqual(children)
      })

      it('removes a list item from the middle of the list', () => {
        editor.selection = {
          anchor: { path: [0, 1, 0], offset: 6 },
          focus: { path: [0, 1, 0], offset: 6 },
        }
        handleList(editor, 'numbered-list')
        expect(editor.children).toEqual([
          numberedList([listItem('Text')]),
          paragraph('Text 2'),
          numberedList([listItem('Text 3')]),
        ])
      })

      it('adds a list item to the middle of the list', () => {
        handleList(editor, 'numbered-list')
        expect(editor.children).toEqual(children)
      })

      it('removes a list item from the end of the list', () => {
        editor.selection = {
          anchor: { path: [0, 2, 0], offset: 6 },
          focus: { path: [0, 2, 0], offset: 6 },
        }
        handleList(editor, 'numbered-list')
        expect(editor.children).toEqual([
          numberedList([listItem('Text'), listItem('Text 2')]),
          paragraph('Text 3'),
        ])
      })

      it('adds a list item to the end of the list', () => {
        handleList(editor, 'numbered-list')
        expect(editor.children).toEqual(children)
      })
    })
  })

  describe('handleBlockQuote', () => {
    beforeAll(() => {
      editor = createEditor()
      editor.insertNode(paragraph('Text'))
    })

    it('wraps a paragraph in a block quote', () => {
      handleBlockQuote(editor, 'block-quote')
      expect(editor.children).toEqual([blockQuote([paragraph('Text')])])
    })

    it('unwraps a paragraph', () => {
      handleBlockQuote(editor, 'block-quote')
      expect(editor.children).toEqual([paragraph('Text')])
    })

    it('wraps a heading in a block quote', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([headingOne('Text')])

      handleBlockQuote(editor, 'block-quote')
      expect(editor.children).toEqual([blockQuote([headingOne('Text')])])
    })

    it('unwraps a heading', () => {
      handleBlockQuote(editor, 'block-quote')
      expect(editor.children).toEqual([headingOne('Text')])
    })
  })
})
