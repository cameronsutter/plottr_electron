import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { Button } from 'react-bootstrap'

const UnMemoisedMarkButton = ({ mark, icon, editor }) => {
  return (
    <Button
      bsStyle={isMarkActive(editor, mark) ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, mark)
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
}

export const MarkButton = React.memo(UnMemoisedMarkButton)

const isMarkActive = (editor, mark) => {
  const marks = Editor.marks(editor)
  return marks ? marks[mark] === true : false
}

export const toggleMark = (editor, mark) => {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark)
  } else {
    Editor.addMark(editor, mark, true)
  }
}
