import { isEqual, minBy, maxBy } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { useEffect, useState, useRef } from 'react'
import { newEditQueue, enqueue, drainQueue } from './editQueue'
import { useTextConverter } from './helpers'

// Input Events
const USER_KEY_DOWN = 'USER_KEY_DOWN'
const NEW_VALUE_FROM_SLATE = 'NEW_VALUE_FROM_SLATE'
const OTHER_EDITOR_CHANGE_SIGNAL = 'OTHER_EDITOR_CHANGE_SIGNAL'
const RECEIVE_EDITOR_OPERATIONS = 'RECEIVE_EDITOR_OPERATIONS'
const RECEIVE_NEW_INITIAL_VALUE = 'RECEIVE_NEW_INITIAL_VALUE'
const UNDO_OR_REDO = 'UNDO_OR_REDO'
const EDITOR_DRIFT = 'EDITOR_DRIFT'
const RESET = 'RESET'

// States
const INITIALISED = 'INITIALISATION'
const RECEIVED_OPERATIONS = 'RECEIVED_OPERATIONS'
const CONTENT_EDITED = 'CONTENT_EDITED'
const UPDATED_EDIT_TIME_STAMPS = 'UPDATED_EDIT_TIME_STAMPS'
const UPDATED_FROM_INITIAL_VALUE = 'UPDATED_FROM_INITIAL_VALUE'
const KEY_PRESSED = 'KEY_PRESSED'
const CONFLICT_DETECTED = 'CONFLICT_DETECTED'
const RESET_FROM_INITIAL_VALUE = 'RESET_FROM_INITIAL_VALUE'

const ONE_MINUTE = 60 * 1000

const enqueueOperation = (queue, value, selection, operation) => {
  queue.push({ created: operation.created, value, selection, operation })
}

const findEditsAfter = (edits, operation) => {
  const editsAfter = []
  const created = operation.created.toDate()
  edits.forEach((operation) => {
    if (operation.created > created) {
      editsAfter.push(operation)
    }
  })
  return editsAfter
}

const isNumber = (x) => typeof x === 'number'

export const pathIsAfter = (thisPath, thatPath) => {
  if (!thatPath) return false
  if (!thisPath) return false

  const maxDepth = Math.max(thisPath.length, thatPath.length)
  for (let i = 0; i < maxDepth; ++i) {
    const thatNode = thatPath[i]
    const thisNode = thisPath[i]
    if (!isNumber(thatNode) || !isNumber(thisNode)) return false
    if (thatNode > thisNode) return true
    if (thisNode < thatNode) return false
  }
  return false
}

export const pathToNumber = (path) => {
  if (!path) return Number.POSITIVE_INFINITY

  return path.reduce((acc, next, index) => {
    return acc + next / Math.pow(10, index)
  }, 0)
}

export const editsConflict = (editsAfter, operationsToApply) => {
  const editsImpactSameLine = editsAfter.some((afterEdit) => {
    const afterPath = afterEdit.operation.operation.path
    return operationsToApply.some((toApplyOperation) => {
      const toApplyPath = toApplyOperation.operation.path
      return isEqual(afterPath, toApplyPath)
    })
  })
  if (editsImpactSameLine) return true

  const earliestPathOfEditAfterThatSplits = minBy(
    editsAfter
      .filter(
        ({
          operation: {
            operation: { type },
          },
        }) => type === 'split_node'
      )
      .map(
        ({
          operation: {
            operation: { path },
          },
        }) => path
      ),
    pathToNumber
  )
  const earliestPathOfOperationToApplyThatSplits = minBy(
    operationsToApply
      .filter(({ operation: { type } }) => type === 'split_node')
      .map(({ operation: { path } }) => path),
    pathToNumber
  )
  const furthestNonSplitEditAfter = maxBy(
    editsAfter
      .filter(
        ({
          operation: {
            operation: { type },
          },
        }) => type !== 'split_node' && type !== 'set_selection'
      )
      .map(({ operation }) => operation),
    (operation) => {
      return pathToNumber(operation.path)
    }
  )
  const furthestNonSplitOperationEdit = maxBy(
    operationsToApply.filter(
      ({ operation: { type } }) => type !== 'split_node' && type !== 'set_selection'
    ),
    (operation) => {
      return pathToNumber(operation.path)
    }
  )

  const weSplitBeforeIncomingOperation =
    earliestPathOfEditAfterThatSplits &&
    furthestNonSplitOperationEdit &&
    pathIsAfter(earliestPathOfEditAfterThatSplits, furthestNonSplitOperationEdit.operation.path)

  const theySplitBeforeOurEdit =
    earliestPathOfOperationToApplyThatSplits &&
    furthestNonSplitEditAfter &&
    pathIsAfter(earliestPathOfOperationToApplyThatSplits, furthestNonSplitEditAfter.path)

  return weSplitBeforeIncomingOperation || theySplitBeforeOurEdit
}

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
  const [valueAndSelection, setValueAndSelection] = useState({
    value: initialValue,
    selection: initialSelection,
  })

  // The state of the FSM
  const state = useRef(INITIALISED)

  // # Non-re-rendering state
  const editQueue = useRef(newEditQueue())
  const editCount = useRef(0)
  const handlingKeyDown = useRef(false)
  const latestEdits = useRef({})
  const editHistory = useRef([])
  const lastPublished = useRef(-1)
  const valueUpdateTimer = useRef(null)
  const deferredOperationsToApply = useRef([])

  // # State Updaters

  // Might want a flag for rolling back in time...?
  const setEditorState = (value, selection) => {
    setValueAndSelection({
      value,
      selection,
    })
  }

  // # Output Stimuli

  const handleContentEdited = () => {
    if (state.current !== CONTENT_EDITED) return

    if (publishOperations && fileId && editorId) {
      const operationsToPublish = editHistory.current.slice(lastPublished.current)
      if (!operationsToPublish.length) return
      publishOperations(
        fileId,
        editorId,
        key.current,
        operationsToPublish.map(({ operation }) => operation)
      )
      lastPublished.current = editHistory.current.length
    }
  }

  const handleReceivedOperations = () => {
    if (state.current !== RECEIVED_OPERATIONS) return

    // Don't re-apply old edits.
    const operationsToApply = drainQueue(editQueue.current).filter((operation) => {
      return operation.created.toDate() > openTime.current
    })
    if (operationsToApply.length) {
      const oldestOperation = operationsToApply.reduce((oldestOperation, nextOperation) => {
        if (nextOperation.created.toDate() < nextOperation.created.toDate()) {
          return nextOperation
        }
        return oldestOperation
      })
      const editsAfter = findEditsAfter(editHistory.current, oldestOperation)
      if (editsAfter.length && editsConflict(editsAfter, operationsToApply)) {
        handleEvent(EDITOR_DRIFT, { editsAfter, operationsToApply })
        return
      }

      operationsToApply.forEach((operation) => {
        editor.apply(operation.operation)
        if (latestEdits.current[operation.editorKey].read < operation.editNumber) {
          latestEdits.current[operation.editorKey].read = operation.editNumber
        }
      })
    }
  }

  const cleanUp = (editTimestamps) => {
    const editorKeysToRemove = []
    Object.entries(editTimestamps).forEach(([editorKey, { timeStamp }]) => {
      if (new Date() - timeStamp.toDate() > ONE_MINUTE) {
        deleteChangeSignal(fileId, editorId, editorKey)
        editorKeysToRemove.push(editorKey)
      }
    })
    editorKeysToRemove.forEach((editorKey) => {
      delete editTimestamps[editorKey]
    })
  }

  // When we get a change signal, loop back to the event handler.
  const handleUpdatedEditTimeStamps = () => {
    if (state.current !== UPDATED_EDIT_TIME_STAMPS) return

    cleanUp(latestEdits.current)
    const handleChange = () => {
      Object.entries(latestEdits.current).forEach(([editorKey, { goal, read }]) => {
        if (goal > read && editorKey !== key.current) {
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
  }

  const handleConflict = () => {
    if (!deferredOperationsToApply.current.length) return

    deferredOperationsToApply.current.forEach((operation) => {
      editor.apply(operation.operation)
      if (latestEdits.current[operation.editorKey].read < operation.editNumber) {
        latestEdits.current[operation.editorKey].read = operation.editNumber
      }
    })
    deferredOperationsToApply.current = []

    // This is where I thought I could fetch the current state of the
    // value, but this approach is flawed because we don't know how
    // long it'll be between us updating redux with what we thought
    // the value should be and when we receive a (potentially)
    // conflicting edit from a peer.

    handleEvent(RESET)
  }

  const effect = () => {
    setTimeout(() => {
      handleContentEdited()
      handleReceivedOperations()
      handleUpdatedEditTimeStamps()
      handleConflict()
    }, 0)
  }

  // TODO: Every minute, clean out our history of edits...

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
    valueUpdateTimer.current = setTimeout(() => {
      onValueChanged(value, selection)
      valueUpdateTimer.current = null
    }, 500)
  }

  const updateValueAndSelection = (newValue) => {
    const { value, selection } = valueAndSelection
    if (!isEqual(selection, editor.selection)) {
      const nextSelection = { ...editor.selection }
      setEditorState(newValue, nextSelection)
      if (value !== newValue) {
        deboundecOnUpdateValue(newValue, nextSelection)
      } else {
        deboundecOnUpdateValue(null, nextSelection)
      }
    } else if (value !== newValue) {
      setEditorState(newValue, selection)
      deboundecOnUpdateValue(newValue)
    }
  }

  const recordHistoryOfEdits = () => {
    const { value, selection } = valueAndSelection
    const editorOperations = editor.operations.map((operation) => {
      return {
        editorKey: key.current,
        operation,
        created: new Date(),
        editNumber: editCount.current++,
      }
    })
    editorOperations.forEach((operation) => {
      enqueueOperation(editHistory.current, value, selection, operation)
    })
  }

  const handleNewValueFromSlate = (newValue) => {
    if (state.current !== RECEIVED_OPERATIONS) {
      recordHistoryOfEdits()
    }
    updateValueAndSelection(newValue)
    state.current = CONTENT_EDITED
  }

  const handleNewInitialValue = () => {
    const { value, selection } = valueAndSelection
    // undoId goes null when we undo.
    if (!undoId || !value || !selection) {
      state.current = UPDATED_FROM_INITIAL_VALUE
      setEditorState(initialValue, initialSelection)
    }
  }

  const handleOtherEditorChange = (latestEditsPerEditor) => {
    latestEditsPerEditor.forEach(({ editNumber, editorKey, timeStamp }) => {
      if (!latestEdits.current[editorKey]) {
        latestEdits.current[editorKey] = { read: -1 }
      }
      latestEdits.current[editorKey].goal = editNumber
      latestEdits.current[editorKey].timeStamp = timeStamp
    })
    state.current = UPDATED_EDIT_TIME_STAMPS
  }

  const handleReceiveEditorOperations = (operations) => {
    operations.forEach((operation) => {
      if (operation.editorKey !== key.current) {
        enqueue(editQueue.current, operation.editorKey, operation, operation.editNumber)
      }
    })
    state.current = RECEIVED_OPERATIONS
  }

  const handleEditorDrift = ({ editsAfter, operationsToApply }) => {
    editor.selection = null
    setEditorState(editsAfter[0].value, null)
    deferredOperationsToApply.current = operationsToApply
    lastPublished.current = editHistory.current.length
    state.current = CONFLICT_DETECTED
  }

  const handleResetEditor = () => {
    setEditorState(editor.children, null)
    state.current = RESET_FROM_INITIAL_VALUE
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
      case OTHER_EDITOR_CHANGE_SIGNAL:
        handleOtherEditorChange(payload)
        break
      case RECEIVE_EDITOR_OPERATIONS:
        handleReceiveEditorOperations(payload)
        break
      case EDITOR_DRIFT:
        handleEditorDrift(payload)
        break
      case RESET:
        handleResetEditor()
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
  }, [initialValue, undoId])

  // Listen for and fetch edits made by other editors
  useEffect(() => {
    let unsubscribe = () => {}
    if (fetchOperations && fileId && editorId) {
      unsubscribe = listenForChangeSignals(fileId, editorId, (editTimestamps) => {
        handleEvent(OTHER_EDITOR_CHANGE_SIGNAL, editTimestamps)
      })
    }
    return unsubscribe
  }, [fileId, editorId])

  // Handle editor changed events
  const onChange = (newValue) => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    deleteOldChanges(fileId, editorId)
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

  // Handle user typing
  const onKeyDown = (event) => {
    if (state.current === RESET_FROM_INITIAL_VALUE) return

    handleUndoRedo(event)
    handleEvent(USER_KEY_DOWN, event)
  }

  return [valueAndSelection.value, valueAndSelection.selection, key, onChange, onKeyDown]
}
