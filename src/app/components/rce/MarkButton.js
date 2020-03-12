import React, { useState } from 'react'
import { Editor } from 'slate'
import { Button } from 'react-bootstrap'

const MarkButton = ({ editor, format, icon }) => {
  const isMarkActive = () => {
    const marks = Editor.marks(editor)
    console.log(editor)
    return marks ? marks[format] === true : false
  }

  const toggleMark = event => {
    event.preventDefault()
    if (isMarkActive()) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  const [isActive] = useState(isMarkActive())
  // console.log(format, isActive)

  return <Button bsStyle={isActive ? 'success' : 'default'} onClick={toggleMark}>{icon}</Button>
}
export default MarkButton