import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import saver from '../middlewares/saver'
import history from '../middlewares/history'

export default function configureStore (initialState) {
  console.log('configure', initialState)
  let createStoreWithMiddleware = applyMiddleware(saver, history)(createStore)
  const store = createStoreWithMiddleware(rootReducer, initialState)

  return store
}
