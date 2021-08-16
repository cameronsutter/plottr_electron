import { setPreviousAction } from '../../common/utils/error_reporter'
import { shouldIgnoreAction } from './shouldIgnoreAction'

const reporter = (store) => (next) => (action) => {
  if (shouldIgnoreAction(action)) return next(action)

  setPreviousAction(action)
  return next(action)
}

export default reporter
