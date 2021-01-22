import { createEditor } from '../helpers'
import { handleHeadings, handleList } from '../BlockButton'

describe('BlockButton', () => {
  let editor

  describe('handleHeadings', () => {
    beforeAll(() => {
      editor = createEditor()
      editor.insertNode({
        type: 'paragraph',
        children: [{ text: '' }]
      })
    })

    it('Turns an empty paragraph into a heading', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([{
        type: 'heading-one',
        children: [{ text: '' }]
      }])
    })

    it('Turns an empty heading into a paragraph', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([{
        type: 'paragraph',
        children: [{ text: '' }]
      }])
    })

    it('Turns a paragraph with text into a heading', () => {
      editor.insertText('Text')
      handleHeadings(editor, 'heading-two')
      expect(editor.children).toEqual([{
        type: 'heading-two',
        children: [{ text: 'Text' }]
      }])
    })

    it('Turns one heading into another kind of heading', () => {
      handleHeadings(editor, 'heading-one')
      expect(editor.children).toEqual([{
        type: 'heading-one',
        children: [{ text: 'Text' }]
      }])
    })
  })

  describe('lists', () => {
    beforeAll(() => {
      editor = createEditor()
      editor.insertNode({
        type: 'paragraph',
        children: [{ text: '' }]
      })
    })

    it('turns an empty paragraph into a list', () => {
      handleList(editor, 'bullet-list')
      expect(editor.children).toEqual([{
        type: 'bullet-list',
        children: [{
          type: 'list-item',
          children: [{ text: '' }]
        }]
      }])
    })
  })
})
