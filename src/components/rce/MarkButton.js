import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'

import Button from '../Button'

const UnMemoisedMarkButton = ({ mark, icon, editor, selection, logger }) => {
  return (
    <Button
      bsStyle={isMarkActive(editor, mark, logger) ? 'primary' : 'default'}
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
  selection: PropTypes.object,
  logger: PropTypes.object.isRequired,
}

export const MarkButton = React.memo(UnMemoisedMarkButton)

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
