import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'

import Button from '../Button'

const UnMemoisedMarkButton = ({ mark, icon, editor, logger }) => {
  const [markIsActive, setMarkIsActive] = useState(false)

  useEffect(() => {
    const timeout = setInterval(() => {
      const newMarkIsActive = isMarkActive(editor, mark, logger)
      if (newMarkIsActive !== markIsActive) {
        setMarkIsActive(newMarkIsActive)
      }
    }, 100)

    return () => {
      clearInterval(timeout)
    }
  }, [setMarkIsActive, markIsActive, editor.selection, logger])

  return (
    <Button
      bsStyle={markIsActive ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, mark, logger)
      }}
    >
      {icon}
    </Button>
  )
}

UnMemoisedMarkButton.propTypes = {
  mark: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.mark === nextProps.mark &&
    prevProps.icon === nextProps.icon &&
    prevProps.editor.selection === nextProps.editor.selection &&
    prevProps.logger === nextProps.logger
  )
}

export const MarkButton = React.memo(UnMemoisedMarkButton, areEqual)

const isMarkActive = (editor, mark, logger) => {
  try {
    const marks = Editor.marks(editor)
    return marks ? marks[mark] === true : false
  } catch (error) {
    logger.error('Error finding whether the mark is active', error)
    return false
  }
}

export const toggleMark = (editor, mark, logger) => {
  if (isMarkActive(editor, mark, logger)) {
    Editor.removeMark(editor, mark)
  } else {
    Editor.addMark(editor, mark, true)
  }
}
