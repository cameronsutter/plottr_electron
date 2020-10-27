import React from 'react'
import { Editor, Transforms } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'
import { LIST_TYPES } from './helpers'

const BlockButton = ({ format, icon }) => {
  const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === format,
    })

    return !!match
  }

  const toggleBlock = (editor, format) => {
    const isInList = Editor.isInList(editor, editor.selection)

    Transforms.unwrapNodes(editor, {
      match: n => LIST_TYPES.includes(n.type),
      split: true,
    })

    Transforms.setNodes(editor, {
      type: 'paragraph',
    })

    if (!isInList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
      
      const nodes = [...Editor.nodes(editor, {
        match: n => n.type === 'paragraph'
      })]

      for (const [, path] of nodes) {
        Transforms.setNodes(editor, {
          type: 'list-item',
          at: path,
        });
      }
      
      // all the nodes should have the same parent since we wrapped them
      const [, parentPath] = Editor.parent(editor, nodes[0][1]);

      // if the next sibling is the same kind of list we want to merge them
      // this has to be first because the next operation has the potential of
      // changing the parent path
      const nextSibling = Editor.nextSibling(editor, parentPath);
      if (nextSibling != null && nextSibling[0].type === format) {
        Transforms.mergeNodes(editor, {
          at: nextSibling[1],
        });
      }

      // if the previous sibling is the same kind of list we want to merge them
      const previousSibling = Editor.previousSibling(editor, parentPath);
      if (previousSibling != null && previousSibling[0].type === format) {
        Transforms.mergeNodes(editor, {
          at: parentPath,
        });
      }
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