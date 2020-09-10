import React, { useState, useRef } from 'react'
import { findDOMNode } from 'react-dom'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'
import { Button, Glyphicon, Overlay } from 'react-bootstrap'
import MiniColorPicker from '../MiniColorPicker'

export const ColorButton = (props) => {
  const editor = useSlate()
  const [dialogOpen, setOpen] = useState(false)
  const [selection, setSelection] = useState()
  const btnRef = useRef(null)
  const getColor = (color) => {
    if (selection) {
      editor.apply({
        type: 'set_selection',
        properties: { anchor: selection.anchor, focus: selection.focus },
        newProperties: { anchor: selection.anchor, focus: selection.focus },
      })
    }
    Editor.addMark(editor, 'color', color)
    setOpen(false)
  }

  // TODO: send MiniColorPicker the selected color
  return <div style={{display: 'inline'}}>
    <Button
      bsStyle={isColorActive(editor) ? 'primary' : 'default'}
      onMouseDown={event => {
        event.preventDefault()
        setSelection(editor.selection)
        if (isColorActive(editor)) {
          Editor.removeMark(editor, 'color')
        } else {
          setOpen(!dialogOpen)
        }
      }}
      ref={btnRef}
    >
      <Glyphicon glyph='text-color'/>
    </Button>
    <Overlay
      show={dialogOpen}
      placement='bottom'
      container={() => findDOMNode(props.el.current)}
      target={() => findDOMNode(btnRef.current)}
    >
      <MiniColorPicker chooseColor={getColor} el={props.el} close={() => setOpen(false)}/>
    </Overlay>
  </div>
}

const isColorActive = editor => {
  const [color] = Editor.nodes(editor, { match: n => n.color })
  return !!color
}
