import React, { useState, useEffect, useRef } from 'react'
import { Glyphicon } from 'react-bootstrap'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'

export const FontSizeChooser = () => {
  const editor = useSlate()
  const fontSizeRef = useRef(null)
  const [currentSize, setCurrentSize] = useState(getCurrentSize(editor))

  useEffect(() => {
    setCurrentSize(getCurrentSize(editor))
  }, [editor.selection])

  return (
    <div className="font-size-chooser">
      <button
        disabled={currentSize < 2}
        className="font-size-btn"
        onClick={(event) => {
          event.preventDefault()
          if (currentSize > 1) {
            setCurrentSize(currentSize - 1)
            addFontSizeMark(editor, currentSize)
          }
        }}
      >
        <Glyphicon glyph="minus" />
      </button>
      <input
        ref={fontSizeRef}
        className="font-size__input"
        type="number"
        value={currentSize || 20}
        onChange={() => {
          setCurrentSize(parseInt(fontSizeRef.current.value))
          addFontSizeMark(editor, parseInt(fontSizeRef.current.value))
        }}
      />
      <button
        disabled={currentSize > 80}
        className="font-size-btn"
        onClick={() => {
          if (currentSize <= 80) {
            setCurrentSize(currentSize + 1)
            addFontSizeMark(editor, currentSize)
          }
        }}
      >
        <Glyphicon glyph="plus" />
      </button>
    </div>
  )
}

const getCurrentSize = (editor) => {
  const [node] = Editor.nodes(editor, { match: (n) => n.fontSize })
  if (node) {
    return node[0].fontSize
  } else {
    return 20
  }
}

const addFontSizeMark = (editor, size) => {
  Editor.addMark(editor, 'fontSize', size)
}
