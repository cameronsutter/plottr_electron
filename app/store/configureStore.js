import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import saver from '../middlewares/saver'

export default function configureStore (initialState) {
  let createStoreWithMiddleware = applyMiddleware(saver)(createStore)
  const store = createStoreWithMiddleware(rootReducer, initialState)

  return store
}
