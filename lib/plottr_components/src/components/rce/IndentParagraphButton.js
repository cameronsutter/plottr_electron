import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { FaIndent } from 'react-icons/fa'
import { Transforms, Editor } from 'slate'

import Button from '../Button'
import { isBlockActive } from './BlockButton'

const indent = (editor, listType, logger) => {
  const isInList = Editor.isInList(editor, editor.selection)
  if (!isInList) return

  const [, parentPath] = Editor.parentOfType(editor, editor.selection, {
    match: (_) => true,
  })
  const previousElement = Editor.previousSibling(editor, parentPath)

  Editor.withoutNormalizing(editor, () => {
    const block = { type: listType, children: [] }
    Transforms.wrapNodes(editor, block, { at: parentPath })
  })
  Editor.normalize(editor)
}

const IndentParagraphButton = ({ editor, logger }) => {
  const [listType, setListType] = useState(false)
  const [blockIsActive, setBlockIsActive] = useState(false)

  useEffect(() => {
    const timeout = setInterval(() => {
      const numberListIsActive = isBlockActive(editor, 'numbered-list', logger)
      const bulletListIsActive = isBlockActive(editor, 'bulleted-list', logger)

      const newBlockIsActive = numberListIsActive || bulletListIsActive
      if (newBlockIsActive !== blockIsActive) {
        setBlockIsActive(newBlockIsActive)
      }

      const newListType = numberListIsActive
        ? 'numbered-list'
        : bulletListIsActive
        ? 'bulleted-list'
        : null
      if (newListType !== listType) {
        setListType(newListType)
      }
    }, 100)

    return () => {
      clearInterval(timeout)
    }
  }, [setListType, listType, setBlockIsActive, blockIsActive, editor.selection, logger])

  const handleClick = useCallback(
    (event) => {
      event.preventDefault()
      indent(editor, listType, logger)
    },
    [editor, logger, listType]
  )

  return (
    <Button bsStyle={cx('default', { disabled: !blockIsActive })} onMouseDown={handleClick}>
      <FaIndent />
    </Button>
  )
}

IndentParagraphButton.propTypes = {
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export default IndentParagraphButton
