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
    platform: { log, openExternal, undo, redo },
  } = connector

  const ToolBar = UnconnectedToolBar(connector)

  const RichTextEditor = ({
    undoId,
    text,
    selection,
    darkMode,
    className,
    autoFocus,
    onChange,
  }) => {
    const editor = useMemo(() => {
      return createEditor()
    }, [])
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const renderElement = useCallback(
      (innerProps) => <Element {...innerProps} openExternal={openExternal} />,
      [openExternal]
    )
    const [value, setValue] = useState(null)
    const [editorSelection, setEditorSelection] = useState({ ...editor.selection })
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    const key = useRef(Math.random().toString(16))
    useEffect(() => {
      // undoId goes null when we undo.
      if (!undoId || !value || !editorSelection) {
        setValue(useTextConverter(text)) // eslint-disable-line
        if (selection && selection.anchor && selection.focus) {
          editor.selection = selection
          setEditorSelection(selection)
        } else {
          setEditorSelection({ ...editor.selection })
        }
      }
    }, [text, undoId])
    useEffect(() => {
      if (autoFocus && editorWrapperRef && editorWrapperRef.firstChild) {
        editorWrapperRef.firstChild.focus()
      }
    }, [autoFocus, editorWrapperRef])

    const registerEditor = useRegisterEditor(editor)

    if (!value) return null

    const updateValue = (newVal) => {
      setValue(newVal)

      // Rules for changing are complicated because we need to support
      // editors which don't use programatic undo and therefore don't
      // track the current selection.
      if (
        selection &&
        editor.selection &&
        !isEqual(editorSelection, editor.selection) &&
        editor.selection.anchor &&
        editor.selection.focus
      ) {
        setEditorSelection({ ...editor.selection })
        if (value !== newVal) {
          onChange(newVal, { ...editor.selection })
        } else {
          onChange(null, { ...editor.selection })
        }
      } else if (value !== newVal) {
        onChange(newVal)
      }
    }

    const handleKeyDown = (event) => {
      // If we don't have a selection, then the editor can't support
      // programatic undo.  This isn't desirable because built-in undo
      // leads to strange interactions when, e.g. the user undoes
      // something, selections outside the RCE and then undoes again.
      // (The result could be that text in the RCE is redone!)
      //
      // To ensure that the RCE has a selection, make sure that the on
      // change handlers create actions that add `editorMetadata`.
      // See the `editors` reducer for schema.
      if (selection && event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }
      // On Linux, redo is CTRL+y
      if (selection && event.key === 'y' && event.ctrlKey) {
        event.preventDefault()
        redo()
        return
      }
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
    }

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={updateValue} key={key.current}>
        <div className={cx('slate-editor__wrapper', className)}>
          <ToolBar editor={editor} darkMode={darkMode} selection={editorSelection} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              setEditorWrapperRef(e)
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', { darkmode: darkMode })}
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
    selection: PropTypes.object,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    darkMode: PropTypes.bool,
    className: PropTypes.string,
    undoId: PropTypes.string,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      undoId: selectors.undoIdSelector(state.present),
    }))(RichTextEditor)
  }

  throw new Error('Could not connect RichTextEditor')
}

export default RichTextEditorConnector
