import React from 'react'
import { Editor, Transforms } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'
import {
  LIST_TYPES,
  HEADING_TYPES,
} from './helpers'

const BlockButton = ({ format, icon }) => {
  const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === format,
    })

    return !!match
  }

  const handleList = (editor, format) => {
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
  
      // all the nodes should have the same parent since we wrapped them
      const [, parentPath] = Editor.parentOfType(editor, editor.selection, {
        match: n => LIST_TYPES.includes(n.type)
      });

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

  const handleHeadings = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    if (isActive) {
      Transforms.unwrapNodes(editor, {
        match: n => n.type === format,
        split: true
      });
      return;
    }

    const [isInHeading] = Editor.nodes(editor, {
      match: n => HEADING_TYPES.includes(n.type),
    });

    // if the node is in a heading (won't be the same type
    // since that is handled above) we have to remove the 
    // other heading as they can't be nested 
    if (Boolean(isInHeading)) {
      Transforms.unwrapNodes(editor, {
        match: n => HEADING_TYPES.includes(n.type),
        split: true,
      });
    }

    // wrap in the new heading type
    Transforms.wrapNodes(editor, { type: format });
  }

  const handleBlockQuote = (editor, format) => {
    const isActive = isBlockActive(editor, format)

    if (isActive) {
      Transforms.unwrapNodes(editor, {
        match: n => n.type === format,
        split: true,
      });
      return;
    }
    
    // if the node is wrapped in a heading, we want the block quote around the heading
    const [heading, headingPath] = Editor.parentOfType(editor, editor.selection, {
      match: n => HEADING_TYPES.includes(n.type),
    });
    if (heading != null) {
      Transforms.wrapNodes(editor, { type: format }, { at: headingPath });
    } else {
      Transforms.wrapNodes(editor, { type: format });
    }
  }

  const toggleBlock = (editor, format) => {
    if (LIST_TYPES.includes(format)) {
      return handleList(editor, format)
    }

    if (HEADING_TYPES.includes(format)) {
      return handleHeadings(editor, format)
    }

    if (format === 'block-quote') {
      return handleBlockQuote(editor, format);
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
