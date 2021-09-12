import React, { useCallback, useMemo, useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import isHotkey from 'is-hotkey'
import { Transforms } from 'slate'
import { Slate, Editable, ReactEditor } from 'slate-react'
import UnconnectedToolBar from './ToolBar'
import { toggleMark } from './MarkButton'
import Leaf from './Leaf'
import Element from './Element'
import { createEditor } from './helpers'
import { useRegisterEditor } from './editor-registry'
import { withEditState } from './withEditState'

import { checkDependencies } from '../checkDependencies'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditorConnector = (connector) => {
  const {
    platform: {
      storage: { imagePublicURL, isStorageURL },
      log,
      openExternal,
      publishRCEOperations,
      fetchRCEOperations,
      listenForChangesToEditor,
      deleteChangeSignal,
      deleteOldChanges,
      undo,
      redo,
    },
  } = connector
  checkDependencies({
    imagePublicURL,
    isStorageURL,
    log,
    openExternal,
    publishRCEOperations,
    fetchRCEOperations,
    listenForChangesToEditor,
    deleteChangeSignal,
    deleteOldChanges,
    undo,
    redo,
  })

  const ToolBar = UnconnectedToolBar(connector)

  const RichTextEditor = ({
    id,
    undoId,
    text,
    selection,
    darkMode,
    className,
    autoFocus,
    onChange,
    fileId,
    clientId,
  }) => {
    const editor = useMemo(() => {
      return createEditor()
    }, [])
    const registerEditor = useRegisterEditor(editor)

    // Rendering helpers
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const renderElement = useCallback(
      (innerProps) => (
        <Element
          {...innerProps}
          openExternal={openExternal}
          imagePublicURL={imagePublicURL}
          isStorageURL={isStorageURL}
        />
      ),
      [openExternal]
    )

    // Focus on first render
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    useEffect(() => {
      if (autoFocus && editorWrapperRef && editorWrapperRef.firstChild) {
        editorWrapperRef.firstChild.focus()
      }
    }, [autoFocus, editorWrapperRef])

    // State management
    const [value, currentSelection, key, onValueChanged, onKeyDown] = withEditState(
      editor,
      id,
      fileId,
      clientId,
      onChange,
      publishRCEOperations,
      fetchRCEOperations,
      listenForChangesToEditor,
      deleteChangeSignal,
      deleteOldChanges,
      undo,
      redo,
      text,
      selection
    )

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
      onKeyDown(event)
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

    useEffect(() => {
      return () => {
        onValueChanged(null, {})
      }
    }, [])

    const handleClickEditable = (event) => {
      if (!editorWrapperRef) return
      if (editorWrapperRef.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.firstChild.focus()
    }

    if (value === null) return null

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={onValueChanged} key={key.current}>
        <div className={cx('slate-editor__wrapper', className)}>
          <ToolBar editor={editor} darkMode={darkMode} selection={currentSelection} />
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
    id: PropTypes.string,
    fileId: PropTypes.string,
    selection: PropTypes.object,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    darkMode: PropTypes.bool,
    className: PropTypes.string,
    undoId: PropTypes.string,
    clientId: PropTypes.string,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      undoId: selectors.undoIdSelector(state.present),
      clientId: selectors.clientIdSelector(state.present),
    }))(RichTextEditor)
  }

  throw new Error('Could not connect RichTextEditor')
}

export default RichTextEditorConnector
