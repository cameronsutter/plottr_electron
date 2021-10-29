import React, { useCallback, useMemo, useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { t } from 'plottr_locales'
import isHotkey from 'is-hotkey'
import { Transforms } from 'slate'
import { Slate, Editable, ReactEditor } from 'slate-react'
import UnconnectedToolBar from './ToolBar'
import { toggleMark } from './MarkButton'
import Leaf from './Leaf'
import Element from './Element'
import { Spinner } from '../Spinner'
import { createEditor } from './helpers'
import { useRegisterEditor } from './editor-registry'
import { useEditState } from './withEditState'

import { checkDependencies } from '../checkDependencies'
import { FaLock } from 'react-icons/fa'

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
      lockRCE,
      listenForRCELock,
      releaseRCELock,
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
    isCloudFile,
    emailAddress,
  }) => {
    // Editor instance
    const editor = useMemo(() => {
      return createEditor()
    }, [])
    const registerEditor = useRegisterEditor(editor)

    const [lock, setLock] = useState(isCloudFile ? null : true)
    const [focus, setFocus] = useState(null)
    const [stealingLock, setStealingLock] = useState(false)

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

    const stealLock = useCallback(() => {
      setStealingLock(true)
      lockRCE(fileId, id, clientId, emailAddress)
        .then(() => {
          setStealingLock(false)
        })
        .catch((error) => {
          console.error('Error stealing the lock for editor: ', id)
          setStealingLock(false)
        })
    }, [fileId, id, clientId, emailAddress])

    const relinquishLock = useCallback(() => {
      if (releaseRCELock && lock?.clientId === clientId) {
        releaseRCELock(fileId, id)
      }
    }, [fileId, id, clientId, lock])

    const handleOnBlur = () => {
      setFocus(false)
      relinquishLock()
    }

    const handleOnFocus = () => {
      setFocus(true)
      if (!lock || !lock.clientId) {
        stealLock()
      }
    }

    // Check for edit locks
    useEffect(() => {
      return listenForRCELock(fileId, id, clientId, (lockResult) => {
        if (!isEqual(lockResult, lock)) {
          setLock(lockResult)
          if ((focus || focus === null) && (!lockResult || !lockResult.clientId)) {
            stealLock()
          }
        }
      })
    }, [setLock, fileId, lock, id, clientId, stealLock, focus])

    // Focus on first render
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    useEffect(() => {
      if (autoFocus && editorWrapperRef && editorWrapperRef.firstChild) {
        editorWrapperRef.firstChild.focus()
      }
    }, [autoFocus, editorWrapperRef])

    // State management
    const [value, currentSelection, key, onValueChanged, onKeyDown] = useEditState(
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
      selection,
      undoId
    )

    const handleKeyDown = (event) => {
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
        onValueChanged(null, null)
      }
    }, [])

    useEffect(() => {
      return () => {
        if (releaseRCELock && lock?.clientId === clientId) {
          releaseRCELock(fileId, id)
        }
      }
    }, [lock, fileId, id])

    const handleClickEditable = (event) => {
      if (!editorWrapperRef) return
      if (editorWrapperRef.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.firstChild.focus()
    }

    if (value === null) return null

    if (!lock) {
      return <Spinner />
    }

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={onValueChanged} key={key.current}>
        {lock.clientId && lock.clientId !== clientId ? (
          <div className="lock-icon__wrapper" disabled={stealingLock} onClick={stealLock}>
            <span>{t('Take Control')}</span>
            <FaLock />
          </div>
        ) : null}
        <div className={cx('slate-editor__wrapper', className)}>
          <ToolBar editor={editor} darkMode={darkMode} selection={currentSelection} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              setEditorWrapperRef(e)
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', {
              darkmode: darkMode,
              rceLocked: lock.clientId && lock.clientId !== clientId,
            })}
          >
            <Editable
              disabled={lock.clientId && lock.clientId !== clientId}
              spellCheck
              {...otherProps}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder={t('Enter some text...')}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onInput={handleInput}
              onBlur={handleOnBlur}
              onFocus={handleOnFocus}
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
    isCloudFile: PropTypes.bool,
    emailAddress: PropTypes.string,
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
      fileId: selectors.selectedFileIdSelector(state.present),
      isCloudFile: selectors.isCloudFileSelector(state.present),
      emailAddress: selectors.emailAddressSelector(state.present),
    }))(RichTextEditor)
  }

  throw new Error('Could not connect RichTextEditor')
}

export default RichTextEditorConnector
