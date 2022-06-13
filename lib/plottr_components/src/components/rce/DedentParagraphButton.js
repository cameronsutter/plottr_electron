import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { FaOutdent } from 'react-icons/fa'

import Button from '../Button'
import { isBlockActive } from './BlockButton'

const DedentParagraphButton = ({ editor, logger }) => {
  const [blockIsActive, setBlockIsActive] = useState(false)

  useEffect(() => {
    const timeout = setInterval(() => {
      const numberListIsActive = isBlockActive(editor, 'numbered-list', logger)
      const bulletListIsActive = isBlockActive(editor, 'bulleted-list', logger)
      const newBlockIsActive = numberListIsActive || bulletListIsActive
      if (newBlockIsActive !== blockIsActive) {
        setBlockIsActive(newBlockIsActive)
      }
    }, 100)

    return () => {
      clearInterval(timeout)
    }
  }, [setBlockIsActive, blockIsActive, editor.selection, logger])

  return (
    <Button
      bsStyle={cx('default', { disabled: !blockIsActive })}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      <FaOutdent />
    </Button>
  )
}

DedentParagraphButton.propTypes = {
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export default DedentParagraphButton
