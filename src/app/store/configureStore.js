import { isEqual } from 'lodash'
import { createStore, applyMiddleware } from 'redux'
import undoable, { excludeAction } from 'redux-undo'
import thunk from 'redux-thunk'

import { rootReducer, ActionTypes, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'

import tracker from '../middlewares/tracker'
import logger from '../middlewares/logger'
import reporter from '../middlewares/reporter'
import actionRecorder from '../middlewares/actionRecorder'
import firebaseSync from '../middlewares/firebaseSync'
import dataRepairers from './dataRepairers'

// Ten seconds
const TIME_DELTA_TO_BUNDLE_UNDOS = 10000
const ACTIONS_TO_BATCH = 20

const sameActionCloseInTime = (action, currentState, _previousHistory) => {
  const sameActionAsLastTime = action.type === currentState.actions.lastAction
  const sameKeysAsLastTime = isEqual([...Object.keys(action)], currentState.actions.lastActionKeys)

  if (sameActionAsLastTime && sameKeysAsLastTime) {
    const editorPath = action.editorMetadata && action.editorMetadata.editorPath
    const editorPathSuffix = editorPath ? '_' + editorPath : ''
    const timeNow = new Date() * 1
    const timeDelta = timeNow - currentState.actions.lastActionTimestamp
    const actionCountBatch = Math.floor(currentState.actions.editCount / ACTIONS_TO_BATCH)
    if (timeDelta > TIME_DELTA_TO_BUNDLE_UNDOS) {
      return `${action.type}_${timeNow}${editorPathSuffix}_${actionCountBatch}`
    }
    return `${action.type}_${currentState.actions.startTimestamp}${editorPathSuffix}_${actionCountBatch}`
  }

  return null
}

export function configureStore(whenClientIsReady, initialState) {
  const reducer = undoable(rootReducer(dataRepairers), {
    limit: 40,
    ignoreInitialState: true,
    groupBy: sameActionCloseInTime,
    filter: excludeAction([
      ActionTypes.RESET_ACTION_RECORDER,
      ActionTypes.RECORD_LAST_ACTION,
      ...SYSTEM_REDUCER_ACTION_TYPES,
    ]),
  })
  const middlewares = applyMiddleware(
    thunk,
    actionRecorder,
    firebaseSync,
    tracker(whenClientIsReady),
    logger,
    reporter
  )
  const store = createStore(reducer, initialState, middlewares)
  return store
}
