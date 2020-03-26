import React from 'react'
import { Editor, Transforms } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const BlockButton = ({ format, icon }) => {
  const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === format,
    })

    return !!match
  }
  const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format)
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
      match: n => LIST_TYPES.includes(n.type),
      split: true,
    })

    Transforms.setNodes(editor, {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    })

    if (!isActive && isList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  }

  const editor = useSlate()

  return (
    <Button
      bsStyle={isBlockActive(editor, format) ? 'primary' : 'default'}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      {icon}
    </Button>
  )
}
export default BlockButton