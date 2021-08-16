import { isEqual } from 'lodash'
import { createStore, applyMiddleware, compose } from 'redux'
import devToolsEnhancer from 'remote-redux-devtools'
import { rootReducer, ActionTypes } from 'pltr/v2'
import saver from '../middlewares/saver'
import tracker from '../middlewares/tracker'
import logger from '../middlewares/logger'
import reporter from '../middlewares/reporter'
import actionRecorder from '../middlewares/actionRecorder'
import undoable, { excludeAction } from 'redux-undo'
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

function configureStore(initialState) {
  const reducer = undoable(rootReducer(dataRepairers), {
    limit: 40,
    ignoreInitialState: true,
    groupBy: sameActionCloseInTime,
    filter: excludeAction([ActionTypes.RESET_ACTION_RECORDER, ActionTypes.RECORD_LAST_ACTION]),
  })
  const middlewares = applyMiddleware(actionRecorder, saver, tracker, logger, reporter)
  const enhancers =
    process.env.NODE_ENV === 'production'
      ? middlewares
      : compose(
          middlewares,
          devToolsEnhancer({
            hostname: 'localhost',
            port: 8000,
            realtime: true,
          })
        )
  const store = createStore(reducer, initialState, enhancers)
  return store
}

const store = configureStore()
export { store }
