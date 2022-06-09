import React from 'react'
import PropTypes from 'prop-types'
import { Editor } from 'slate'

import Glyphicon from '../Glyphicon'
import Button from '../Button'

const UnforwardedColorButton = ({ editor, toggle, logger }, ref) => {
  // TODO: send MiniColorPicker the selected color
  return (
    <div className="tool-bar__color-button-wrapper" ref={ref}>
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
    </div>
  )
}

UnforwardedColorButton.propTypes = {
  editor: PropTypes.object,
  toggle: PropTypes.func,
  logger: PropTypes.object,
}

export const ColorButton = React.forwardRef(UnforwardedColorButton)

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
