import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import isHotkey from 'is-hotkey'
import { Transforms } from 'slate'
import { Slate, Editable, ReactEditor } from 'slate-react'
import UnconnectedToolBar from './ToolBar'
import { toggleMark } from './MarkButton'
import Leaf from './Leaf'
import Element from './Element'
import { useTextConverter, createEditor } from './helpers'
import { useRegisterEditor } from './editor-registry'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditorConnector = (connector) => {
  const {
    platform: { log, openExternal },
  } = connector

  const ToolBar = UnconnectedToolBar(connector)

  const RichTextEditor = ({ ...props }) => {
    const editor = useMemo(() => {
      return createEditor()
    }, [])
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const renderElement = useCallback(
      (innerProps) => <Element {...innerProps} openExternal={openExternal} />,
      [openExternal]
    )
    const [value, setValue] = useState(null)
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    const key = useRef(Math.random().toString(16))
    useEffect(() => {
      if (!value) {
        setValue(useTextConverter(props.text)) // eslint-disable-line
      }
    }, [props.text])
    useEffect(() => {
      if (props.autoFocus && editorWrapperRef && editorWrapperRef.firstChild) {
        editorWrapperRef.firstChild.focus()
        document.execCommand('selectAll', false, null)
        document.getSelection().collapseToStart()
      }
    }, [props.autoFocus, editorWrapperRef])

    const registerEditor = useRegisterEditor(editor)

    const [editorSelection, setEditorSelection] = useState(editor.selection)

    if (!value) return null

    const updateValue = (newVal) => {
      setValue(newVal)

      if (!isEqual(editorSelection, editor.selection)) {
        setEditorSelection({ ...editor.selection })
      }
      // only update if it changed
      // (e.g. this event could fire with a selection change, but the text is the same)
      if (value !== newVal) {
        props.onChange(newVal)
      }
    }

    const handleKeyDown = (event) => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
      }
    }

    const handleKeyUp = () => {
      // scroll to the cursor
      if (editor.selection == null) return
      try {
        const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.focus)
        const node = domPoint[0]
        let isElem = false
        let parent = node.parentElement
        // find the closest parent that is a slate element
        while (!isElem) {
          if (parent == null) {
            isElem = true
            return
          }
          if (parent.dataset.slateNode == 'element') {
            isElem = true
          } else {
            parent = parent.parentElement
          }
        }
        parent.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } catch (e) {
        // Do nothing if there is an error.
      }
    }

    const handleInput = (e) => {
      e.stopPropagation()
      try {
        const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.anchor)
        // domPoint.nodeValue is the whole line, we just want the corrected word
        const selectionBegin = editor.selection.anchor.offset
        const substr = domPoint[0].nodeValue.substr(selectionBegin)
        let endIndex = substr.search(/\W/) // first non-word character
        if (endIndex == -1) {
          // the word is the last on the line with no characters (space/period) after it
          endIndex = undefined
        }
        const correctedWord = substr.substring(0, endIndex)
        if (correctedWord) {
          Transforms.delete(editor, { at: editor.selection })
          Transforms.insertText(editor, correctedWord, { at: editor.selection })
          Transforms.collapse(editor, { edge: 'anchor' })
        }
      } catch (error) {
        log.warn(error)
      }
    }

    const handleClickEditable = (event) => {
      if (!editorWrapperRef) return
      if (editorWrapperRef.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.firstChild.focus()
      // Select all text
      // Push cursor/focus to last char
      // document.execCommand('selectAll', false, null)
      // document.getSelection().collapseToEnd()
    }

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={updateValue} key={key.current}>
        <div className={cx('slate-editor__wrapper', props.className)}>
          <ToolBar editor={editor} darkMode={props.darkMode} selection={editorSelection} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              setEditorWrapperRef(e)
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', { darkmode: props.darkMode })}
          >
            <Editable
              spellCheck
              {...otherProps}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder={i18n('Enter some text...')}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onInput={handleInput}
            />
          </div>
        </div>
      </Slate>
    )
  }

  RichTextEditor.propTypes = {
    text: PropTypes.any,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    darkMode: PropTypes.bool,
    className: PropTypes.string,
  }

  return RichTextEditor
}

export default RichTextEditorConnector
