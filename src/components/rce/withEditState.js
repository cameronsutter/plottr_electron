import { isEqual } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { useEffect, useState, useRef } from 'react'
import { useTextConverter } from './helpers'

// Input Events
const USER_KEY_DOWN = 'USER_KEY_DOWN'
const NEW_VALUE_FROM_SLATE = 'NEW_VALUE_FROM_SLATE'
const RECEIVE_NEW_INITIAL_VALUE = 'RECEIVE_NEW_INITIAL_VALUE'
const UNDO_OR_REDO = 'UNDO_OR_REDO'

// States
const INITIALISED = 'INITIALISATION'
const CONTENT_EDITED = 'CONTENT_EDITED'
const UPDATED_FROM_INITIAL_VALUE = 'UPDATED_FROM_INITIAL_VALUE'
const UNDONE = 'UNDONE'
const KEY_PRESSED = 'KEY_PRESSED'
const RESET_FROM_INITIAL_VALUE = 'RESET_FROM_INITIAL_VALUE'

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
export const useEditState = (
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

  // # Re-rendering state
  const [valueAndSelection, setValueAndSelection] = useState({
    value: useTextConverter(initialValue),
    selection: initialSelection,
  })

  // The state of the FSM
  const state = useRef(INITIALISED)

  // # Non-re-rendering state
  const handlingKeyDown = useRef(false)
  const valueUpdateTimer = useRef(null)
  const deferredValuesToUpdate = useRef({})
  const justPasted = useRef(false)

  // # State Updaters

  // Might want a flag for rolling back in time...?
  const setEditorState = (value, selection) => {
    setValueAndSelection({
      value,
      selection,
    })
  }

  // # Output Stimuli
  const effect = () => {
    setTimeout(() => {}, 0)
  }

  // # Transitions

  const handleKeyDown = (_event) => {
    handlingKeyDown.current = true
    setTimeout(() => {
      handlingKeyDown.current = false
    }, 100)
    state.current = KEY_PRESSED
  }

  const deboundecOnUpdateValue = (value, selection) => {
    if (valueUpdateTimer.current) {
      clearTimeout(valueUpdateTimer.current)
    }
    deferredValuesToUpdate.current.value = value || deferredValuesToUpdate.current.value
    deferredValuesToUpdate.current.selection = selection || deferredValuesToUpdate.current.selection
    valueUpdateTimer.current = setTimeout(() => {
      onValueChanged(deferredValuesToUpdate.current.value, deferredValuesToUpdate.current.selection)
      deferredValuesToUpdate.current.value = null
      deferredValuesToUpdate.current.selection = null
      valueUpdateTimer.current = null
    }, 100)
  }

  const updateValueAndSelection = (newValue) => {
    const { value, selection } = valueAndSelection
    if (!isEqual(selection, editor.selection)) {
      const nextSelection = editor.selection === null ? null : { ...editor.selection }
      setEditorState(newValue, nextSelection)
      if (value !== newValue) {
        deboundecOnUpdateValue(newValue, nextSelection)
      } else {
        deboundecOnUpdateValue(null, nextSelection)
      }
    } else if (value !== newValue || selection !== initialSelection) {
      setEditorState(newValue, selection)
      deboundecOnUpdateValue(newValue)
    }
  }

  const handleNewValueFromSlate = (newValue) => {
    if (state.current === UNDONE) {
      state.current = UPDATED_FROM_INITIAL_VALUE
    }
    if (justPasted.current) {
      justPasted.current = false
      updateValueAndSelection(useTextConverter(newValue))
    } else {
      updateValueAndSelection(newValue)
    }
    state.current = CONTENT_EDITED
  }

  const handleNewInitialValue = () => {
    const { value, selection } = valueAndSelection
    // undoId goes null when we undo.
    if (!undoId) {
      state.current = UNDONE
    } else if (!value || !selection) {
      state.current = UPDATED_FROM_INITIAL_VALUE
    }
    setEditorState(useTextConverter(initialValue), initialSelection)
    editor.selection = initialSelection
  }

  // # Event Handler

  function handleEvent(event, payload) {
    switch (event) {
      case USER_KEY_DOWN:
        handleKeyDown(payload)
        break
      case NEW_VALUE_FROM_SLATE:
        handleNewValueFromSlate(payload)
        break
      case RECEIVE_NEW_INITIAL_VALUE:
        handleNewInitialValue()
        break
    }
    effect()
    return
  }

  // # Input Stimuli

  // Handle changes in initial value
  useEffect(() => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    handleEvent(RECEIVE_NEW_INITIAL_VALUE)
  }, [initialValue, initialSelection, undoId])

  // Handle editor changed events
  const onChange = (newValue) => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    handleEvent(NEW_VALUE_FROM_SLATE, newValue)
  }

  const handleUndoRedo = (event) => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    // If we don't have a selection, then the editor can't support
    // programatic undo.  This isn't desirable because built-in undo
    // leads to strange interactions when, e.g. the user undoes
    // something, selections outside the RCE and then undoes again.
    // (The result could be that text in the RCE is redone!)
    //
    // To ensure that the RCE has a selection, make sure that the on
    // change handlers create actions that add `editorMetadata`.
    // See the `editors` reducer for schema.
    const { selection } = valueAndSelection
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
  }

  // It's possible for invalid RCE data to result from pasting.
  const onPaste = (event) => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    justPasted.current = true
  }

  // Handle user typing
  const onKeyDown = (event) => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    handleUndoRedo(event)
    handleEvent(USER_KEY_DOWN, event)
  }

  return [valueAndSelection.value, valueAndSelection.selection, key, onChange, onKeyDown, onPaste]
}
