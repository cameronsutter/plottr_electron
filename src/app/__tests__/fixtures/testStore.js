import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import undoable, { excludeAction } from 'redux-undo'

import { rootReducer, ActionTypes, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'

export function configureStore(whenClientIsReady, initialState) {
  const reducer = undoable(rootReducer({}), {
    limit: 40,
    ignoreInitialState: true,
    filter: excludeAction([
      ActionTypes.RESET_ACTION_RECORDER,
      ActionTypes.RECORD_LAST_ACTION,
      ...SYSTEM_REDUCER_ACTION_TYPES,
    ]),
  })
  const middlewares = applyMiddleware(thunk)
  const store = createStore(reducer, initialState, middlewares)
  return store
}
