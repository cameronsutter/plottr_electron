import { isEqual } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { useEffect, useState, useRef } from 'react'
import { newEditQueue, enqueue, drainQueue } from './editQueue'
import { useTextConverter } from './helpers'

const USER_KEY_DOWN = 'USER_KEY_DOWN'
const NEW_VALUE_FROM_SLATE = 'NEW_VALUE_FROM_SLATE'
const OTHER_EDITOR_CHANGE_SIGNAL = 'OTHER_EDITOR_CHANGE_SIGNAL'
const RECEIVE_EDITOR_OPERATIONS = 'RECEIVE_EDITOR_OPERATIONS'
const NEW_VALUE_FROM_REDUX = 'NEW_VALUE_FROM_REDUX'
const UNDO_OR_REDO = 'UNDO_OR_REDO'

const ONE_MINUTE = 60 * 1000

/**
 * # Introduction
 *
 *   This hook manages simultaneous editing.
 *
 *   It turns out, that modelling simultaneous edits is a tricky
 *   business.
 *
 *   There are several competing asynchronous events that may happen
 *   in an inconvenient sequence or at an inconvenient time.  In this
 *   hook, we model all of those events as state transitions in a
 *   Finite State Machine (FSM).
 *
 * # Events
 *
 *   1. User key down.
 *   2. Signal change received from other editor.
 *   3. Our query for other editor operations returned with data.
 *   4. Redux gave us a new value for the editor.
 *   5. Undo/Redo called by user.
 *
 * # Pieces of State
 *
 * ## State that Should Cause a Re-Render
 *
 *   The following pieces of state are involved in how the RCE is
 *   drawn and should cause it to re-draw every time that they change.
 *
 *   - value.  The value (tree) of the RCE.
 *   - selection.  The cursor and anchor point for the RCE.
 *
 * ## State that Shouldn't Cause a Re-Render
 *
 *   The following pieces of state are involved in tracking edits and
 *   editing states.  They're not involved in how the RCE looks so we
 *   use `useRef` to remove them from re-draw cycles.
 *
 *   - applyingOtherEdits.  A flag that indicates whether we're
 *      currently applying edits from the queue
 *   - editQueue.  A collection of priority queues that tracks the edits
 *      that we still need to apply from other editors.
 *   - editCount.  A tracker for the number of edits we made.  Helps
 *      other editors know whether they missed one of our edits.
 *   - handlingKeyDown.  Indicates that we're in the middle of
 *      the key down handler.
 *   - latestEdits.  Tracks where we've read to and what the goal edit
 *     number is for each registered editor for this RCE.
 *
 * # Cleaning Up Afterwards
 *
 *   Every editor pushes changes to Firestore for other editors to
 *   read.  These build up over time, and we want to clean these up
 *   before they use up all of our storage.
 *
 *   There are two mechanisms that we use:
 *
 *   1. Every time that an editor changes, we delete any changes older
 *      than a minute ago.
 *
 *   2. Every time that changes are signalled, if any of the editor
 *      change records is older than a minute then we delete it.
 *
 *   This is partly handled by the the Firebase library, but I've
 *   documented it here because I think that this is where it's most
 *   useful to know about it.
 */
export const withEditState = (
  editor,
  editorId,
  fileId,
  clientId,
  onValueChanged,
  publishOperations,
  fetchOperations,
  listenForChangeSignals,
  deleteChangeSignal,
  deleteOldChanges,
  undo,
  redo,
  initialValue,
  initialSelection,
  undoId
) => {
  // # Constants
  const key = useRef(uuidv4())
  const openTime = useRef(new Date())

  // # Re-rendering state
  const [value, setValue] = useState(initialValue)
  const [selection, setSelection] = useState(initialSelection)

  // # Non-re-rendering state
  const applyingOtherEdits = useRef(false)
  const editQueue = useRef(newEditQueue())
  const editCount = useRef(0)
  const handlingKeyDown = useRef(false)
  const latestEdits = useRef({})

  // # Transitions

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
    handlingKeyDown.current = true
    setTimeout(() => {
      handlingKeyDown.current = false
    }, 100)
  }

  const handleNewValueFromSlate = (newValue) => {
    setValue(newValue)
    if (applyingOtherEdits.current) {
      applyingOtherEdits.current = false
      return
    }
    if (publishOperations && fileId && editorId) {
      publishOperations(
        fileId,
        editorId,
        key.current,
        editor.operations.map((operation) => ({
          editorKey: key.current,
          operation,
          created: new Date(),
          editNumber: editCount.current++,
        }))
      )
    }
    if (!isEqual(selection, editor.selection)) {
      // Rules for changing are complicated because we need to support
      // editors which don't use programatic undo and therefore don't
      // track the current selection.
      if (
        selection &&
        editor.selection &&
        !isEqual(selection, editor.selection) &&
        editor.selection.anchor &&
        editor.selection.focus
      ) {
        setSelection({ ...editor.selection })
        if (value !== newValue) {
          onValueChanged(newValue, { ...editor.selection })
        } else {
          onValueChanged(null, { ...editor.selection })
        }
      }
    } else if (value !== newValue) {
      onValueChanged(newValue)
    }
  }

  const handleNewValueFromRedux = () => {
    // undoId goes null when we undo.
    if (!undoId || !value || !selection) {
      setValue(useTextConverter(initialValue)) // eslint-disable-line
      if (selection && selection.anchor && selection.focus) {
        try {
          editor.selection = selection
          setSelection(selection)
        } catch (error) {
          console.error("Couldn't set seleciton, ", error)
          setSelection({})
        }
      } else {
        setSelection({ ...editor.selection })
      }
    }
  }

  const handleOtherEditorChange = (latestEditsPerEditor) => {
    latestEditsPerEditor.forEach(({ editNumber, editorKey }) => {
      if (!latestEdits.current[editorKey]) {
        latestEdits.current[editorKey] = { read: -1 }
      }
      latestEdits.current[editorKey].goal = editNumber
    })
  }

  const handleReceiveEditorOperations = (operations) => {
    operations.forEach((operation) => {
      if (operation.editorKey !== key.current) {
        enqueue(editQueue.current, operation.editorKey, operation, operation.editNumber)
      }
    })
    // Should I drain the queue straight away or defer it??
    //
    // Don't re-apply old edits.
    const operationsToApply = drainQueue(editQueue.current).filter((operation) => {
      return operation.created.toDate() > openTime.current
    })
    if (operationsToApply.length) {
      applyingOtherEdits.current = true
      operationsToApply.forEach((operation) => {
        editor.apply(operation.operation)
        if (latestEdits.current[operation.editorKey].read < operation.editNumber) {
          latestEdits.current[operation.editorKey].read = operation.editNumber
        }
      })
    }
  }

  // # Event Handler

  const handleEvent = (event, payload) => {
    switch (event) {
      case USER_KEY_DOWN:
        handleKeyDown(payload)
        break
      case NEW_VALUE_FROM_SLATE:
        handleNewValueFromSlate(payload)
        break
      case NEW_VALUE_FROM_REDUX:
        handleNewValueFromRedux()
        break
      case OTHER_EDITOR_CHANGE_SIGNAL:
        handleOtherEditorChange(payload)
        break
      case RECEIVE_EDITOR_OPERATIONS:
        handleReceiveEditorOperations(payload)
        break
    }
    return
  }

  // # Incoming Events

  // Handle changes in initial value
  useEffect(() => {
    handleEvent(NEW_VALUE_FROM_REDUX)
  }, [initialValue, undoId])

  const cleanUp = (editTimestamps) => {
    editTimestamps.forEach(({ editorKey, timeStamp }) => {
      if (new Date() - timeStamp.toDate() > ONE_MINUTE) {
        deleteChangeSignal(fileId, editorId, editorKey)
      }
    })
  }

  // Listen for and fetch edits made by other editors
  useEffect(() => {
    if (fetchOperations && fileId && editorId) {
      listenForChangeSignals(fileId, editorId, (editTimestamps) => {
        handleEvent(OTHER_EDITOR_CHANGE_SIGNAL, editTimestamps)
        cleanUp(editTimestamps)
        const handleChange = () => {
          Object.entries(latestEdits.current).forEach(([editorKey, { goal, read }]) => {
            if (goal > read) {
              fetchOperations(fileId, editorId, read, editorKey, (operations) => {
                handleEvent(RECEIVE_EDITOR_OPERATIONS, operations)
              })
            }
          })
        }
        function delayIfNecessary() {
          if (handlingKeyDown.current) {
            setTimeout(delayIfNecessary, 100)
          }
          handleChange()
        }
        delayIfNecessary()
      })
    }
    return () => {}
  }, [fileId, editorId])

  // # Callbacks (stimuli)

  // Handle editor changed events
  const onChange = (newValue) => {
    deleteOldChanges(fileId, editorId)
    handleEvent(NEW_VALUE_FROM_SLATE, newValue)
  }

  // Handle user typing
  const onKeyDown = (event) => {
    handleEvent(USER_KEY_DOWN, event)
  }

  return [value, selection, key, onChange, onKeyDown]
}
