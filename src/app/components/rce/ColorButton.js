import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'
import { Button, Glyphicon } from 'react-bootstrap'

export const ColorButton = (props) => {
  const editor = useSlate()

  // TODO: send MiniColorPicker the selected color
  return (
    <Button
      bsStyle={isColorActive(editor) ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        if (isColorActive(editor)) {
          Editor.removeMark(editor, 'color')
        } else {
          props.toggle()
        }
      }}
    >
      <Glyphicon glyph="text-color" />
    </Button>
  )
}

ColorButton.propTypes = {
  toggle: PropTypes.func,
}

const isColorActive = (editor) => {
  const [color] = Editor.nodes(editor, { match: (n) => n.color })
  return !!color
}

export const addColorMark = (editor, color) => {
  Editor.addMark(editor, 'color', color)
}
