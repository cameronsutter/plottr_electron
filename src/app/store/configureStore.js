import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers/root'
import saver from '../middlewares/saver'
// import history from '../middlewares/history'
import tracker from '../middlewares/tracker'
import logger from '../middlewares/logger'
import undoable from 'redux-undo'

export default function configureStore (initialState) {
  const reducer = undoable(rootReducer, {limit: 10, ignoreInitialState: true})
  const middlewares = applyMiddleware(saver, tracker, logger)
  const store = createStore(reducer, initialState, middlewares)
  return store
}
