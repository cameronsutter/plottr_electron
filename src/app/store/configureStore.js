import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import saver from '../middlewares/saver'
// import history from '../middlewares/history'
import tracker from '../middlewares/tracker'
import logger from '../middlewares/logger'

export default function configureStore (initialState) {
  const store = createStore(rootReducer, initialState, applyMiddleware(saver, tracker, logger))
  return store
}
