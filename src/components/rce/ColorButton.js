import React from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { Button, Glyphicon } from 'react-bootstrap'

export const ColorButton = ({ editor, toggle, logger }) => {
  // TODO: send MiniColorPicker the selected color
  return (
    <Button
      bsStyle={isColorActive(editor, logger) ? 'primary' : 'default'}
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
  logger: PropTypes.object.isRequired,
}

const isColorActive = (editor, logger) => {
  try {
    const [color] = Editor.nodes(editor, { match: (n) => n.color })
    return !!color
  } catch (error) {
    logger.error('Error trying to detect if a color is active', error)
    return false
  }
}

export const addColorMark = (editor, color) => {
  Editor.addMark(editor, 'color', color)
}
