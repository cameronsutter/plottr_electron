import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import saver from '../middlewares/saver'
import history from '../middlewares/history'
import tracker from '../middlewares/tracker'

export default function configureStore (initialState) {
  const store = createStore(rootReducer, initialState, applyMiddleware(saver, history, tracker))
  return store
}
