import { setLastAction } from '../../common/utils/error_reporter'

const reporter = store => next => action => {
  setLastAction(action)
  return next(action)
}

export default reporter
