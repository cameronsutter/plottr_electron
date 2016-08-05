import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import saver from '../middlewares/saver'
import history from '../middlewares/history'

export default function configureStore (initialState) {
  const store = createStore(rootReducer, initialState, applyMiddleware(saver, history))
  return store
}
