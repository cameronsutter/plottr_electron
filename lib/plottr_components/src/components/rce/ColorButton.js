import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { Button, Glyphicon } from 'react-bootstrap'

export const ColorButton = ({ editor, toggle }) => {
  // TODO: send MiniColorPicker the selected color
  return (
    <Button
      bsStyle={isColorActive(editor) ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        if (isColorActive(editor)) {
          Editor.removeMark(editor, 'color')
        } else {
          toggle()
        }
      }}
    >
      <Glyphicon glyph="text-color" />
    </Button>
  )
}

ColorButton.propTypes = {
  toggle: PropTypes.func,
  editor: PropTypes.object.isRequired,
}

const isColorActive = (editor) => {
  const [color] = Editor.nodes(editor, { match: (n) => n.color })
  return !!color
}

export const addColorMark = (editor, color) => {
  Editor.addMark(editor, 'color', color)
}
