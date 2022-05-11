import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor, Transforms } from 'slate'

import Button from '../Button'
import { LIST_TYPES, HEADING_TYPES } from './helpers'

export const isBlockActive = (editor, format, logger) => {
  try {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === format,
    })

    return !!match
  } catch (error) {
    logger.error('Error finding whether a block is active', error)
    return false
  }
}

export const handleHeadings = (editor, format, logger) => {
  const isActive = isBlockActive(editor, format, logger)

  // this means that the text is already in the format that
  // was pressed so we should toggle it out of the heading
  if (isActive) {
    Transforms.setNodes(editor, {
      type: 'paragraph',
    })
    return
  }

  const [isInHeading] = Editor.nodes(editor, {
    match: (n) => HEADING_TYPES.includes(n.type),
  })

  // if the node is in a heading (won't be the same type
  // since that is handled above) we want to change the heading type
  // to the new heading type
  if (isInHeading) {
    Transforms.setNodes(editor, {
      type: format,
    })
    return
  }

  // wrap in the new heading type
  Transforms.wrapNodes(editor, { type: format })
}

export const handleList = (editor, format, logger) => {
  try {
    const isInList = Editor.isInList(editor, editor.selection)

    // Careful!  All interactions with the editor might prompt
    // normalisation, which could undo the operation that you're trying
    // to implement.
    Editor.withoutNormalizing(editor, () => {
      Transforms.unwrapNodes(editor, {
        match: (n) => LIST_TYPES.includes(n.type),
        split: true,
      })

      Transforms.setNodes(editor, {
        type: 'paragraph',
      })
    })

    // The reason we don't wrap in a list-item is because the Normalizer takes care of making sure that
    // list-items are the only children of lists. If we try to do it in here we get a double bullet effect
    if (!isInList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)

      // all the nodes should have the same parent since we wrapped them
      const [, parentPath] = Editor.parentOfType(editor, editor.selection, {
        match: (n) => LIST_TYPES.includes(n.type),
      })

      // if the next sibling is the same kind of list we want to merge them
      // this has to be first because the next operation has the potential of
      // changing the parent path
      const nextSibling = Editor.nextSibling(editor, parentPath)
      if (nextSibling != null && nextSibling[0].type === format) {
        Transforms.mergeNodes(editor, {
          at: nextSibling[1],
        })
      }

      // if the previous sibling is the same kind of list we want to merge them
      const previousSibling = Editor.previousSibling(editor, parentPath)
      if (previousSibling != null && previousSibling[0].type === format) {
        Transforms.mergeNodes(editor, {
          at: parentPath,
        })
      }
    }
  } catch (error) {
    logger.error('Error handling lists in editor.', error)
    return
  }
}

export const handleBlockQuote = (editor, format, logger) => {
  const isActive = isBlockActive(editor, format, logger)

  try {
    if (isActive) {
      Transforms.unwrapNodes(editor, {
        match: (n) => n.type === format,
        split: true,
      })
      return
    }

    // if the node is wrapped in a heading, we want the block quote around the heading
    const [heading, headingPath] = Editor.parentOfType(editor, editor.selection, {
      match: (n) => HEADING_TYPES.includes(n.type),
    })
    if (heading != null) {
      Transforms.wrapNodes(editor, { type: format }, { at: headingPath })
    } else {
      Transforms.wrapNodes(editor, { type: format })
    }
  } catch (error) {
    logger.error('Error handling a block quote', error)
    return
  }
}

const BlockButton = ({ editor, format, icon, logger }) => {
  const toggleBlock = (editor, format) => {
    if (LIST_TYPES.includes(format)) {
      handleList(editor, format, logger)
      return
    }

    if (HEADING_TYPES.includes(format)) {
      handleHeadings(editor, format, logger)
      return
    }

    if (format === 'block-quote') {
      handleBlockQuote(editor, format, logger)
      return
    }
  }

  return (
    <Button
      bsStyle={isBlockActive(editor, format, logger) ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      {icon}
    </Button>
  )
}

BlockButton.propTypes = {
  format: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export default BlockButton
