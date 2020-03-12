import React, { useMemo } from 'react'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'

const MarkButton = ({ format, icon }) => {
  const isMarkActive = (editor) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }

  const toggleMark = event => {
    event.preventDefault()
    if (isMarkActive(editor)) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  const editor = useSlate()
  return <Button bsStyle={isMarkActive(editor) ? 'primary' : 'default'} onMouseDown={toggleMark}>{icon}</Button>
}
export default MarkButton