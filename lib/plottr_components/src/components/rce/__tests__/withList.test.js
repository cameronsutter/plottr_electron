import { createEditor } from '../helpers'
import {
  paragraph,
  blockQuote,
  headingOne,
  bulletedList,
  listItem,
  numberedList,
} from '../__fixtures__'

describe('withList', () => {
  let editor = createEditor()

  describe('insertBreak', () => {
    beforeEach(() => {
      editor = createEditor()
    })

    it('inserts a break when at the root of the document', () => {
      editor.insertNode(paragraph('Text'))
      editor.insertBreak()
      expect(editor.children).toEqual([paragraph('Text'), paragraph()])
    })

    it('it inserts a break when inside a non list block', () => {
      editor.insertNode(blockQuote([headingOne('Text')]))
      editor.insertBreak()
      expect(editor.children).toEqual([blockQuote([headingOne('Text'), headingOne()])])
    })

    it('it inserts a new list-item when the list-item has text', () => {
      editor.insertNode(bulletedList([listItem('Text')]))
      editor.insertBreak()
      expect(editor.children).toEqual([bulletedList([listItem('Text'), listItem()])])
    })

    it('lifts changes the list item to a paragraph when it is empty', () => {
      editor.insertNode(bulletedList([listItem('Text'), listItem()]))
      editor.insertBreak()
      expect(editor.children).toEqual([bulletedList([listItem('Text')]), paragraph()])
    })
  })

  describe('deleteBackward', () => {
    beforeEach(() => {
      editor = createEditor()
    })

    it('deletes backwards if we are at the root of the document', () => {
      editor.insertNode(paragraph('Text'))
      editor.deleteBackward()
      expect(editor.children).toEqual([paragraph('Tex')])
    })

    it('deletes backwards if we are in a non list block', () => {
      editor.insertNode(blockQuote([paragraph('Text')]))
      editor.deleteBackward()
      expect(editor.children).toEqual([blockQuote([paragraph('Tex')])])
    })

    it('deletes backwards if in a non empty list item', () => {
      editor.insertNode(numberedList([listItem('Text')]))
      editor.deleteBackward()
      expect(editor.children).toEqual([numberedList([listItem('Tex')])])
    })

    it('lifts an empty list-item to a paragraph', () => {
      editor.insertNode(numberedList([listItem('Text'), listItem()]))
      editor.deleteBackward()
      expect(editor.children).toEqual([numberedList([listItem('Text')]), paragraph()])
    })
  })
})
