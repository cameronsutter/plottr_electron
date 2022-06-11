import { configureStore } from './configureStore'
import { whenClientIsReady } from '../../../shared/socket-client'

const store = configureStore(whenClientIsReady)
export { store }
