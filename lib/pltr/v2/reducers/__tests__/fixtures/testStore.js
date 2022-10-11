import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import undoable, { excludeAction } from 'redux-undo'

import rootReducer from '../../root'
import { RESET_ACTION_RECORDER, RECORD_LAST_ACTION } from '../../../constants/ActionTypes'
import { SYSTEM_REDUCER_ACTION_TYPES } from '../../systemReducers'

export function configureStore(whenClientIsReady, initialState) {
  const reducer = undoable(rootReducer({}), {
    limit: 40,
    ignoreInitialState: true,
    filter: excludeAction([
      RESET_ACTION_RECORDER,
      RECORD_LAST_ACTION,
      ...SYSTEM_REDUCER_ACTION_TYPES,
    ]),
  })
  const middlewares = applyMiddleware(thunk)
  const store = createStore(reducer, initialState, middlewares)
  return store
}
