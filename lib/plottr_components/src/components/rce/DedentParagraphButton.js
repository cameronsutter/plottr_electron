import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { FaOutdent } from 'react-icons/fa'

import Button from '../Button'
import { isBlockActive, handleList } from './BlockButton'

const DedentParagraphButton = ({ editor, logger }) => {
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
      handleList(editor, listType, logger, true)
    },
    [editor, logger, listType]
  )

  return (
    <Button bsStyle={cx('default', { disabled: !blockIsActive })} onMouseDown={handleClick}>
      <FaOutdent />
    </Button>
  )
}

DedentParagraphButton.propTypes = {
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export default DedentParagraphButton
