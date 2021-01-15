import { createStore, applyMiddleware, compose } from 'redux'
import devToolsEnhancer from 'remote-redux-devtools'
import rootReducer from '../reducers/root'
import saver from '../middlewares/saver'
// import history from '../middlewares/history'
import tracker from '../middlewares/tracker'
import logger from '../middlewares/logger'
import reporter from '../middlewares/reporter'
import undoable from 'redux-undo'

function configureStore (initialState) {
  const reducer = undoable(rootReducer, {limit: 10, ignoreInitialState: true})
  const middlewares = applyMiddleware(saver, tracker, logger, reporter)
  const enhancers = process.env.NODE_ENV === "production"
    ? middlewares
    : compose(
      middlewares,
      devToolsEnhancer({
        hostname: "localhost",
        port: 8000,
        realtime: true
      }))
  const store = createStore(reducer, initialState, enhancers)
  return store
}

const store = configureStore()
export { store }
