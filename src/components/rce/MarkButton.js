import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'

export const MarkButton = ({ mark, icon }) => {
  const editor = useSlate()

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

MarkButton.propTypes = {
  mark: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
}

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
